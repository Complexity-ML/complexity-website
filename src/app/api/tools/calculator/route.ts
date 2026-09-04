import { NextResponse } from "next/server";

import { evaluateArithmetic } from "@/lib/calculator";

interface CalculatorRequest {
  expression?: unknown;
}

export async function POST(request: Request) {
  let body: CalculatorRequest;
  try {
    body = await request.json() as CalculatorRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.expression !== "string") {
    return NextResponse.json({ error: "expression must be a string." }, { status: 400 });
  }

  try {
    return NextResponse.json({
      expression: body.expression,
      result: evaluateArithmetic(body.expression),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid arithmetic expression." },
      { status: 400 },
    );
  }
}
