import { NextResponse } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_MCP_URL = "http://127.0.0.1:8790/mcp";
const HOSTED_MCP_URL = "https://pacific-i64-complexity-source-mcp.hf.space/mcp";
const CALL_TIMEOUT_MS = 15_000;

const requestSchema = z.object({
  url: z.string().url().max(4_000),
});

const sourceSchema = z.object({
  uri: z.string(),
  title: z.string(),
  mediaType: z.string(),
  retrievedAt: z.string(),
  sha256: z.string(),
  content: z.string(),
  offset: z.number(),
  nextOffset: z.number().nullable(),
  totalChars: z.number(),
  truncated: z.boolean(),
});

function sourceServerUrl() {
  const fallback = process.env.NODE_ENV === "production" ? HOSTED_MCP_URL : LOCAL_MCP_URL;
  const value = process.env.SOURCE_MCP_URL?.trim() || fallback;
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("SOURCE_MCP_URL must use HTTP or HTTPS.");
  }
  return url;
}

function githubToolArguments(url: URL) {
  if (url.hostname !== "github.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 5 || parts[2] !== "blob") return null;
  const [owner, repo, , ref, ...path] = parts;
  if (!owner || !repo || !ref || path.length === 0) return null;
  return {
    name: "read_github_source",
    arguments: {
      owner,
      repo,
      ref,
      path: path.join("/"),
      maxChars: 6_000,
    },
  };
}

async function withSourceClient<T>(operation: (client: Client) => Promise<T>) {
  const client = new Client({
    name: "complexity-ai-lab",
    version: "0.1.0",
  });
  const token = process.env.SOURCE_MCP_TOKEN?.trim();
  const transport = new StreamableHTTPClientTransport(sourceServerUrl(), {
    requestInit: token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined,
  });
  try {
    await client.connect(transport);
    return await operation(client);
  } finally {
    await client.close().catch(() => undefined);
  }
}

export async function GET() {
  try {
    const tools = await withSourceClient(async (client) => {
      const result = await client.listTools(undefined, { timeout: CALL_TIMEOUT_MS });
      return result.tools.map((tool) => tool.name);
    });
    return NextResponse.json({
      status: "online",
      server: "complexity-source-mcp",
      tools,
    });
  } catch (error) {
    return NextResponse.json({
      status: "offline",
      error: error instanceof Error ? error.message : "Source MCP is unavailable.",
    }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const { url: inputUrl } = requestSchema.parse(await request.json());
    const url = new URL(inputUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return NextResponse.json({ error: "Only public HTTP(S) sources are supported." }, { status: 400 });
    }

    const githubCall = githubToolArguments(url);
    const tool = githubCall ?? {
      name: "read_web_source",
      arguments: { url: url.href, maxChars: 6_000 },
    };

    const result = await withSourceClient((client) => client.callTool(
      tool,
      undefined,
      { timeout: CALL_TIMEOUT_MS },
    ));

    if (result.isError) {
      const content = result.content as Array<{ type?: string; text?: string }>;
      const detail = content
        .filter((item) => item.type === "text")
        .map((item) => item.text ?? "")
        .join("\n");
      return NextResponse.json({ error: detail || "The source could not be read." }, { status: 422 });
    }

    const structuredContent = result.structuredContent as Record<string, unknown> | undefined;
    const source = sourceSchema.parse(structuredContent?.source);
    return NextResponse.json({ source });
  } catch (error) {
    const message = error instanceof z.ZodError
      ? "The source response was invalid."
      : error instanceof Error
        ? error.message
        : "The source could not be read.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
