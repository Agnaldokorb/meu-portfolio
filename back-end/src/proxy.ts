import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://127.0.0.1:5533",
  "http://localhost:5533",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://agnaldo.dev.br",
  "https://www.agnaldo.dev.br",
];

function getAllowedOrigins(): string[] {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return envOrigins && envOrigins.length > 0
    ? envOrigins
    : DEFAULT_ALLOWED_ORIGINS;
}

function buildCorsHeaders(origin: string | null): HeadersInit {
  const allowedOrigins = getAllowedOrigins();
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : "null";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsHeaders = buildCorsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const response = NextResponse.next();

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
