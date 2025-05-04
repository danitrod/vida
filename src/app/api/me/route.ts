import { NextResponse } from "next/server";
import { validateAuth } from "@/lib/auth";

export async function GET() {
  const user = await validateAuth();
  if (user) {
    return NextResponse.json({ user });
  }

  return NextResponse.json({ user: null });
}
