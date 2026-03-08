import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

/**
 * Provider configurations: base URL + how to build the request.
 * All providers use OpenAI-compatible /v1/chat/completions format
 * (or we adapt the request for Anthropic/Google).
 */
const PROVIDER_CONFIG: Record<string, {
  baseUrl: string;
  buildHeaders: (apiKey: string) => Record<string, string>;
  transformBody?: (body: Record<string, unknown>) => Record<string, unknown>;
  endpoint: string;
}> = {
  openai: {
    baseUrl: "https://api.openai.com",
    endpoint: "/v1/chat/completions",
    buildHeaders: (key) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    }),
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    endpoint: "/v1/messages",
    buildHeaders: (key) => ({
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    }),
    transformBody: (body) => {
      // Convert OpenAI format → Anthropic format
      const messages = (body.messages as Array<{ role: string; content: string }>) || [];
      const systemMsg = messages.find((m) => m.role === "system");
      const nonSystem = messages.filter((m) => m.role !== "system");

      return {
        model: body.model || "claude-sonnet-4-20250514",
        max_tokens: body.max_tokens || 4096,
        messages: nonSystem,
        ...(systemMsg ? { system: systemMsg.content } : {}),
        stream: body.stream ?? false,
        temperature: body.temperature,
        top_p: body.top_p,
      };
    },
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com",
    endpoint: "/v1beta/chat/completions",
    buildHeaders: (key) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    }),
  },
  mistral: {
    baseUrl: "https://api.mistral.ai",
    endpoint: "/v1/chat/completions",
    buildHeaders: (key) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    }),
  },
};

// POST /api/proxy/completions — forward to external provider
export async function POST(req: Request) {
  // Auth via i64 API key
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

  // Determine provider from model name or explicit field
  const provider = (body.provider as string) || detectProvider(body.model as string);
  if (!provider || !PROVIDER_CONFIG[provider]) {
    return NextResponse.json(
      { error: { message: `Unknown provider. Specify 'provider' field or use a known model prefix. Available: ${Object.keys(PROVIDER_CONFIG).join(", ")}`, type: "invalid_request_error" } },
      { status: 400 },
    );
  }

  // Get the user's external key for this provider
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

  // Build upstream request
  const upstreamBody = config.transformBody ? config.transformBody(body) : body;
  // Remove our custom fields before forwarding
  delete (upstreamBody as Record<string, unknown>).provider;

  const upstreamUrl = config.baseUrl + config.endpoint;
  const headers = config.buildHeaders(apiKey);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(upstreamBody),
    });

    // Stream passthrough — pipe the upstream response directly
    if (body.stream && upstream.body) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("content-type") || "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Non-streaming — return JSON
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });

  } catch (e) {
    return NextResponse.json(
      { error: { message: `Upstream error: ${e instanceof Error ? e.message : String(e)}`, type: "upstream_error" } },
      { status: 502 },
    );
  }
}

/**
 * Detect provider from model name.
 * gpt-* → openai, claude-* → anthropic, gemini-* → google, mistral-* → mistral
 */
function detectProvider(model?: string): string | null {
  if (!model) return null;
  const m = model.toLowerCase();
  if (m.startsWith("gpt-") || m.startsWith("o1") || m.startsWith("o3") || m.startsWith("o4")) return "openai";
  if (m.startsWith("claude-")) return "anthropic";
  if (m.startsWith("gemini-")) return "google";
  if (m.startsWith("mistral-") || m.startsWith("codestral") || m.startsWith("pixtral")) return "mistral";
  return null;
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
