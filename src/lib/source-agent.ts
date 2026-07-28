import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const LOCAL_MCP_URL = "http://127.0.0.1:8790/mcp";
const HOSTED_MCP_URL = "https://pacific-i64-complexity-source-mcp.hf.space/mcp";

export const SOURCE_CALL_TIMEOUT_MS = 15_000;

function sourceServerUrl() {
  const fallback = process.env.NODE_ENV === "production" ? HOSTED_MCP_URL : LOCAL_MCP_URL;
  const value = process.env.SOURCE_MCP_URL?.trim() || fallback;
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("SOURCE_MCP_URL must use HTTP or HTTPS.");
  }
  return url;
}

export async function withSourceClient<T>(operation: (client: Client) => Promise<T>) {
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
