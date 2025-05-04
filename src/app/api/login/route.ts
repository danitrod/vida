import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongo from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { authorize } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email: usernameOrEmail, password } = await req.json();

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { message: "Usuário e senha são obrigatórios." },
        { status: 400 }
      );
    }

    await mongo.connect();
    const db = mongo.db();
    const users = db.collection("users");

    const user = await users.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { message: "Senha incorreta." },
        { status: 401 }
      );
    }

    await authorize({ username: user.username, email: user.email });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}
