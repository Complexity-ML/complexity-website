import { NextResponse } from "next/server";
import { SOURCE_CALL_TIMEOUT_MS, withSourceClient } from "@/lib/source-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await withSourceClient(async (client) => {
      const tools = await client.listTools(undefined, { timeout: SOURCE_CALL_TIMEOUT_MS });
      if (!tools.tools.some((tool) => tool.name === "search_fantasy_catalog")) {
        throw new Error("Fantasy catalog search is unavailable.");
      }
      const result = await client.callTool(
        { name: "fantasy_catalog_status", arguments: {} },
        undefined,
        { timeout: SOURCE_CALL_TIMEOUT_MS },
      );
      return (result.structuredContent as { catalog?: {
        configured?: boolean;
        entities?: number;
      } } | undefined)?.catalog;
    });
    if (!catalog?.configured || !catalog.entities) {
      throw new Error("Fantasy catalog is not configured.");
    }
    return NextResponse.json({ status: "online", cards: catalog.entities });
  } catch (error) {
    return NextResponse.json({
      status: "offline",
      error: error instanceof Error ? error.message : "Source MCP is unavailable.",
    }, { status: 503 });
  }
}
