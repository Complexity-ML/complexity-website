export const runtime = "edge";

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

// GET /api/inference/monitor?mode=python&endpoint=health
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "python";
  const endpoint = url.searchParams.get("endpoint") || "health";

  const baseUrl = ENDPOINTS[mode];
  if (!baseUrl) {
    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const allowed = ["health", "metrics", "snapshot", "experts"];
  if (!allowed.includes(endpoint)) {
    return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const upstream = await fetch(`${baseUrl}/v1/monitor/${endpoint}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await upstream.json();
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Upstream unavailable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
