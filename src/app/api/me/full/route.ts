import { NextResponse } from "next/server";
import { validateAuth } from "@/lib/auth";
import mongo from "@/lib/mongodb";

export async function GET() {
  const user = await validateAuth();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  await mongo.connect();
  const db = mongo.db();
  const users = db.collection("users");

  const userData = await users.findOne(
    { email: user.email },
    { projection: { password: 0 } }
  );

  if (!userData) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: userData });
}
