import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface DateTimeRequest {
  timezone?: unknown;
}

interface DateTimeValue {
  timezone: string;
  date: string;
  time: string;
  weekday: string;
  utc_offset: string;
}

function formatInstant(instant: Date, timezone: string): DateTimeValue {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  });
  const parts = new Map(
    formatter.formatToParts(instant).map((part) => [part.type, part.value]),
  );
  return {
    timezone,
    date: `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}`,
    time: `${parts.get("hour")}:${parts.get("minute")}:${parts.get("second")}`,
    weekday: parts.get("weekday") ?? "",
    utc_offset: parts.get("timeZoneName") ?? "",
  };
}

function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: DateTimeRequest;
  try {
    body = await request.json() as DateTimeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const timezone = body.timezone === undefined
    ? "Europe/Paris"
    : typeof body.timezone === "string"
      ? body.timezone.trim()
      : "";
  if (!timezone || timezone.length > 100 || !isValidTimezone(timezone)) {
    return NextResponse.json(
      { error: "timezone must be a valid IANA time zone." },
      { status: 400 },
    );
  }

  const instant = new Date();
  return NextResponse.json({
    instant_utc: instant.toISOString(),
    utc: formatInstant(instant, "UTC"),
    paris: formatInstant(instant, "Europe/Paris"),
    requested: formatInstant(instant, timezone),
  });
}
