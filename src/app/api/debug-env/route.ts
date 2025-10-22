// src/app/api/debug-env/route.ts
import { NextResponse } from "next/server";
export async function GET() {
  const hasSecret = !!process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length > 20;
  const url = process.env.NEXTAUTH_URL || null;
  return NextResponse.json({ hasSecret, NEXTAUTH_URL: url });
}
