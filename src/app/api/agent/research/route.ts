import { NextResponse } from "next/server";
import { SOURCE_CALL_TIMEOUT_MS, withSourceClient } from "@/lib/source-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FantasyRelation {
  type?: string;
  targetKey?: string;
  detail?: string | null;
}

interface FantasyCard {
  key?: string;
  kind?: string;
  name?: string;
  summary?: string;
  description?: string;
  facts?: string[];
  relations?: FantasyRelation[];
}

function compactCard(card: FantasyCard) {
  const facts = (card.facts ?? []).slice(0, 4);
  const relations = (card.relations ?? []).slice(0, 5);
  return [
    `[${card.kind ?? "entity"}] ${card.name ?? card.key ?? "Unknown"}`,
    card.summary,
    card.description && card.description !== card.summary ? card.description : undefined,
    facts.length ? `Facts: ${facts.join(" | ")}` : undefined,
    relations.length
      ? `Relations: ${relations.map((relation) => (
        `${relation.type ?? "related_to"} -> ${relation.targetKey ?? "unknown"}${relation.detail ? ` (${relation.detail})` : ""}`
      )).join(" | ")}`
      : undefined,
  ].filter(Boolean).join("\n").slice(0, 1_350);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { query?: unknown };
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (!query || query.length > 500) {
      return NextResponse.json({ error: "A question between 1 and 500 characters is required." }, { status: 400 });
    }

    const search = await withSourceClient(async (client) => {
      const result = await client.callTool(
        {
          name: "search_fantasy_catalog",
          arguments: { query, maxResults: 3 },
        },
        undefined,
        { timeout: SOURCE_CALL_TIMEOUT_MS },
      );
      if (result.isError) throw new Error("Fantasy catalog search failed.");
      return (result.structuredContent as {
        search?: { configured?: boolean; matches?: FantasyCard[] };
      } | undefined)?.search;
    });

    if (!search?.configured) {
      return NextResponse.json({ error: "The fantasy catalog is not configured." }, { status: 503 });
    }
    const cards = (search.matches ?? []).filter((card) => card.key && card.name).slice(0, 3);
    if (cards.length === 0) {
      return NextResponse.json({
        status: "empty",
        selected: [],
        context: "",
      });
    }

    return NextResponse.json({
      status: "ready",
      selected: cards.map((card) => ({
        key: card.key,
        kind: card.kind,
        name: card.name,
      })),
      context: cards.map(compactCard).join("\n\n---\n\n").slice(0, 4_200),
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Research agent unavailable.",
    }, { status: 503 });
  }
}
