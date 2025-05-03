import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongo from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { validateRegistration } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

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
      createdAt: new Date(),
    });

    const token = jwt.sign(
      { user: { username, email } },
      process.env.JWT_SECRET!,
      {
        expiresIn: "60d",
      }
    );

    (await cookies()).set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
