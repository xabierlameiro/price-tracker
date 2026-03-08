import { APP_NAME, APP_VERSION } from "@/lib/constants";
import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET() {
  return NextResponse.json({
    status: "ok",
    name: APP_NAME,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
  });
}
