import { NextResponse } from "next/server";
import { I64Client } from "vllm-i64";
import { validateApiKey } from "@/lib/api-auth";
import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const MAX_STEPS = 10;

// ---------------------------------------------------------------------------
// Provider configs (same as completions proxy, but we need tool support info)
// ---------------------------------------------------------------------------
const PROVIDER_CONFIG: Record<string, {
  baseUrl: string;
  endpoint: string;
  buildHeaders: (apiKey: string) => Record<string, string>;
  // Convert our unified request → provider-native format
  transformRequest?: (body: Record<string, unknown>) => Record<string, unknown>;
  // Extract assistant message + tool_calls from provider response
  parseResponse: (data: Record<string, unknown>) => ParsedResponse;
  // Build the tool-result message in provider format
  buildToolResult: (toolCallId: string, content: string) => Record<string, unknown>;
  // Format tools array for this provider
  formatTools?: (tools: ToolDef[]) => unknown[];
}> = {
  openai: {
    baseUrl: "https://api.openai.com",
    endpoint: "/v1/chat/completions",
    buildHeaders: (key) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    }),
    parseResponse: parseOpenAIResponse,
    buildToolResult: (id, content) => ({ role: "tool", tool_call_id: id, content }),
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    endpoint: "/v1/messages",
    buildHeaders: (key) => ({
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    }),
    transformRequest: transformAnthropicRequest,
    parseResponse: parseAnthropicResponse,
    buildToolResult: buildAnthropicToolResult,
    formatTools: formatAnthropicTools,
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com",
    endpoint: "/v1beta/chat/completions",
    buildHeaders: (key) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    }),
    parseResponse: parseOpenAIResponse,
    buildToolResult: (id, content) => ({ role: "tool", tool_call_id: id, content }),
  },
  mistral: {
    baseUrl: "https://api.mistral.ai",
    endpoint: "/v1/chat/completions",
    buildHeaders: (key) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    }),
    parseResponse: parseOpenAIResponse,
    buildToolResult: (id, content) => ({ role: "tool", tool_call_id: id, content }),
  },
};

// ---------------------------------------------------------------------------
// Tool definitions — what we offer to the LLM
// ---------------------------------------------------------------------------
interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

const AGENT_TOOLS: ToolDef[] = [
  {
    name: "execute_code",
    description: "Execute code in a sandboxed environment. Returns stdout, stderr, and exit code.",
    parameters: {
      type: "object",
      properties: {
        code: { type: "string", description: "The code to execute" },
        language: { type: "string", enum: ["python", "node", "bash"], description: "Programming language (default: python)" },
      },
      required: ["code"],
    },
  },
  {
    name: "rag_search",
    description: "Search the user's indexed documents and return the most relevant chunks.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        k: { type: "integer", description: "Number of results (default: 3)" },
      },
      required: ["query"],
    },
  },
];

function toolsToOpenAI(tools: ToolDef[]) {
  return tools.map((t) => ({
    type: "function" as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

// ---------------------------------------------------------------------------
// Tool execution — calls our own vllm-i64 engine via SDK
// ---------------------------------------------------------------------------
const engine = new I64Client(process.env.VLLM_I64_URL || "http://localhost:8000");

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    if (name === "execute_code") {
      const res = await fetch(`${engine.baseUrl}/v1/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: args.code, language: (args.language as string) || "python" }),
      });
      const data = await res.json();
      const parts: string[] = [];
      if (data.stdout) parts.push(`stdout:\n${data.stdout}`);
      if (data.stderr) parts.push(`stderr:\n${data.stderr}`);
      parts.push(`exit_code: ${data.exit_code}`);
      if (data.timed_out) parts.push("⚠ execution timed out");
      return parts.join("\n");
    }

    if (name === "rag_search") {
      const data = await engine.rag.search(args.query as string, (args.k as number) || 3);
      if (data.results.length > 0) {
        return data.results.map((r, i) =>
          `[${i + 1}] (score: ${r.score.toFixed(3)})\n${r.text}`
        ).join("\n\n");
      }
      return "No results found.";
    }

    return `Unknown tool: ${name}`;
  } catch (e) {
    return `Tool error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// ---------------------------------------------------------------------------
// Provider-specific response parsing
// ---------------------------------------------------------------------------
interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

interface ParsedResponse {
  text: string | null;
  toolCalls: ToolCall[];
  // Raw assistant message to append to history (provider-native format)
  rawAssistantMessage: Record<string, unknown>;
  finishReason: string | null;
}

function parseOpenAIResponse(data: Record<string, unknown>): ParsedResponse {
  const choice = ((data.choices as unknown[]) || [])[0] as Record<string, unknown> | undefined;
  if (!choice) return { text: null, toolCalls: [], rawAssistantMessage: {}, finishReason: null };

  const msg = choice.message as Record<string, unknown>;
  const toolCalls: ToolCall[] = [];

  if (msg.tool_calls) {
    for (const tc of msg.tool_calls as Array<{ id: string; function: { name: string; arguments: string } }>) {
      toolCalls.push({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      });
    }
  }

  return {
    text: (msg.content as string) || null,
    toolCalls,
    rawAssistantMessage: msg,
    finishReason: (choice.finish_reason as string) || null,
  };
}

// Anthropic format: content blocks can be text or tool_use
function parseAnthropicResponse(data: Record<string, unknown>): ParsedResponse {
  const content = (data.content as Array<{ type: string; id?: string; name?: string; input?: Record<string, unknown>; text?: string }>) || [];
  const toolCalls: ToolCall[] = [];
  const textParts: string[] = [];

  for (const block of content) {
    if (block.type === "tool_use" && block.id && block.name) {
      toolCalls.push({ id: block.id, name: block.name, arguments: block.input || {} });
    } else if (block.type === "text" && block.text) {
      textParts.push(block.text);
    }
  }

  return {
    text: textParts.length > 0 ? textParts.join("\n") : null,
    toolCalls,
    rawAssistantMessage: { role: "assistant", content },
    finishReason: (data.stop_reason as string) || null,
  };
}

// ---------------------------------------------------------------------------
// Provider-specific request/tool formatting
// ---------------------------------------------------------------------------
function transformAnthropicRequest(body: Record<string, unknown>): Record<string, unknown> {
  const messages = (body.messages as Array<{ role: string; content: string }>) || [];
  const systemMsg = messages.find((m) => m.role === "system");
  const nonSystem = messages.filter((m) => m.role !== "system");

  return {
    model: body.model || "claude-sonnet-4-20250514",
    max_tokens: body.max_tokens || 4096,
    messages: nonSystem,
    ...(systemMsg ? { system: systemMsg.content } : {}),
    tools: body.tools,
    temperature: body.temperature,
    top_p: body.top_p,
  };
}

function formatAnthropicTools(tools: ToolDef[]) {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}

function buildAnthropicToolResult(toolCallId: string, content: string): Record<string, unknown> {
  return {
    role: "user",
    content: [{ type: "tool_result", tool_use_id: toolCallId, content }],
  };
}

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------
function detectProvider(model?: string): string | null {
  if (!model) return null;
  const m = model.toLowerCase();
  if (m.startsWith("gpt-") || m.startsWith("o1") || m.startsWith("o3") || m.startsWith("o4")) return "openai";
  if (m.startsWith("claude-")) return "anthropic";
  if (m.startsWith("gemini-")) return "google";
  if (m.startsWith("mistral-") || m.startsWith("codestral") || m.startsWith("pixtral")) return "mistral";
  return null;
}

// ---------------------------------------------------------------------------
// POST /api/proxy/agent — orchestrated agent loop
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  const userId = await validateApiKey(req);
  if (!userId) {
    return NextResponse.json(
      { error: { message: "Invalid or missing API key", type: "auth_error" } },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON", type: "invalid_request_error" } },
      { status: 400 },
    );
  }

  const provider = (body.provider as string) || detectProvider(body.model as string);
  if (!provider || !PROVIDER_CONFIG[provider]) {
    return NextResponse.json(
      { error: { message: `Unknown provider. Available: ${Object.keys(PROVIDER_CONFIG).join(", ")}`, type: "invalid_request_error" } },
      { status: 400 },
    );
  }

  const extKey = await prisma.externalKey.findUnique({
    where: { userId_provider: { userId, provider } },
    select: { encryptedKey: true },
  });

  if (!extKey) {
    return NextResponse.json(
      { error: { message: `No ${provider} API key configured. Add one at /dashboard/keys`, type: "auth_error" } },
      { status: 403 },
    );
  }

  const apiKey = decrypt(extKey.encryptedKey);
  const config = PROVIDER_CONFIG[provider];

  // Build initial messages from user request
  const messages: Record<string, unknown>[] = (body.messages as Record<string, unknown>[]) || [];

  // Inject tools into the request
  const tools = config.formatTools ? config.formatTools(AGENT_TOOLS) : toolsToOpenAI(AGENT_TOOLS);

  // Collect steps for the client
  const steps: Array<{ step: number; tool_calls: ToolCall[]; tool_results: Array<{ tool_call_id: string; name: string; result: string }> }> = [];

  // Agent loop
  for (let step = 0; step < MAX_STEPS; step++) {
    // Build upstream request
    let upstreamBody: Record<string, unknown> = {
      ...body,
      messages,
      tools,
      stream: false, // Never stream intermediate steps
    };
    delete upstreamBody.provider;

    if (config.transformRequest) {
      upstreamBody = config.transformRequest(upstreamBody);
    }

    const upstreamUrl = config.baseUrl + config.endpoint;
    const headers = config.buildHeaders(apiKey);

    let data: Record<string, unknown>;
    try {
      const upstream = await fetch(upstreamUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(upstreamBody),
      });
      data = await upstream.json();

      if (!upstream.ok) {
        return NextResponse.json(
          { error: { message: `Upstream ${provider} error`, details: data }, steps },
          { status: upstream.status },
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: { message: `Upstream error: ${e instanceof Error ? e.message : String(e)}`, type: "upstream_error" }, steps },
        { status: 502 },
      );
    }

    const parsed = config.parseResponse(data);

    // No tool calls → final answer
    if (parsed.toolCalls.length === 0) {
      return NextResponse.json({
        response: parsed.text,
        model: body.model,
        provider,
        steps,
        finish_reason: parsed.finishReason,
      });
    }

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      parsed.toolCalls.map(async (tc) => {
        const result = await executeTool(tc.name, tc.arguments);
        return { tool_call_id: tc.id, name: tc.name, result };
      }),
    );

    steps.push({ step: step + 1, tool_calls: parsed.toolCalls, tool_results: toolResults });

    // Append assistant message + tool results to history
    messages.push(parsed.rawAssistantMessage);
    for (const tr of toolResults) {
      messages.push(config.buildToolResult(tr.tool_call_id, tr.result));
    }
  }

  // Max steps reached
  return NextResponse.json({
    response: null,
    model: body.model,
    provider,
    steps,
    finish_reason: "max_steps",
    error: { message: `Agent reached max steps (${MAX_STEPS})`, type: "max_steps" },
  });
}

// CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
}
