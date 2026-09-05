import { NextResponse } from "next/server";

import { knowledgeContext, searchKnowledgeBase } from "@/lib/knowledge-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { query?: unknown };
  try {
    body = await request.json() as { query?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query || query.length > 500) {
    return NextResponse.json(
      { error: "query must be a string between 1 and 500 characters." },
      { status: 400 },
    );
  }

  // This 100M checkpoint is more faithful with one tightly ranked passage
  // than with several overlapping chunks in its 2,048-token context window.
  const matches = searchKnowledgeBase(query, 1);
  return NextResponse.json({
    status: matches.length ? "ready" : "empty",
    matches: matches.map(({ id, title, score }) => ({ id, title, score })),
    context: knowledgeContext(matches),
    passage: matches[0]?.content,
  });
}
