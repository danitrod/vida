import { NextResponse } from "next/server";
import mongo from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { validateRegistration } from "@/lib/validation";
import { authorize } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, email, password, subscribeToPosts } = await req.json();

    const error = validateRegistration({
      username,
      email,
      password,
      confirmPassword: password,
    });
    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    await mongo.connect();
    const db = mongo.db();
    const users = db.collection("users");

    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "Usuário já cadastrado." },
        { status: 409 }
      );
    }

    const existingEmail = await users.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { message: "Email já cadastrado." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await users.insertOne({
      username,
      email,
      password: hashedPassword,
      subscribeToPosts,
      createdAt: new Date(),
    });

    await authorize({ username, email });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
