export const runtime = "edge";

import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

const ENDPOINTS: Record<string, string> = {
  python:
    process.env.API_URL ||
    "https://pacific-prime-pacific-i64-demo.hf.space",
  chat:
    process.env.CHAT_API_URL ||
    "https://pacific-prime-pacific-i64-chat.hf.space",
  ros2:
    process.env.ROS2_API_URL ||
    "https://pacific-prime-pacific-ros2.hf.space",
};

// POST /api/inference — proxy to vllm-i64 server
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token
    ? `${token.provider}::${token.providerAccountId}`
    : undefined;

  const body = await req.json();
  const { mode = "python", ...payload } = body;

  const baseUrl = ENDPOINTS[mode];
  if (!baseUrl) {
    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Inject userId server-side — client can't fake it
  if (userId) {
    payload.user = userId;
  }

  const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // For streaming, pipe the SSE response through
  if (payload.stream) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  }

  // Non-streaming
  const data = await upstream.json();
  return new Response(JSON.stringify(data), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
