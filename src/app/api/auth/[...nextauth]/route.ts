import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

import { authOptions, isAuthenticationConfigured } from "@/auth";

const handler = NextAuth(authOptions);
type AuthRouteContext = { params: Promise<{ nextauth: string[] }> };

function unavailable() {
  return new Response("Authentication is not configured.", { status: 503, headers: { "cache-control": "no-store" } });
}

export async function GET(request: NextRequest, context: AuthRouteContext) {
  if (!isAuthenticationConfigured()) return unavailable();
  return handler(request, context);
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  if (!isAuthenticationConfigured()) return unavailable();
  return handler(request, context);
}
