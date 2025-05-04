import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongo from "@/lib/mongodb";
import { validateUsername } from "@/lib/validation";

export async function PATCH(req: Request) {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ message: "Token inválido." }, { status: 401 });
  }

  const { user } = decoded;
  const currentEmail = user?.email;
  const currentUsername = user?.username;

  if (!currentEmail || !currentUsername) {
    return NextResponse.json(
      { message: "Dados do usuário ausentes." },
      { status: 400 }
    );
  }

  const { username } = await req.json();
  const validationError = validateUsername(username);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    await mongo.connect();
    const db = mongo.db();
    const users = db.collection("users");

    const taken = await users.findOne({
      username,
      email: { $ne: currentEmail }, // Ensure it's not the current user's own doc
    });

    if (taken) {
      return NextResponse.json(
        { message: "Este nome de usuário já está em uso." },
        { status: 409 }
      );
    }

    await users.updateOne({ email: currentEmail }, { $set: { username } });

    const newToken = jwt.sign(
      { user: { email: currentEmail, username } },
      process.env.JWT_SECRET!,
      {
        expiresIn: "60d",
      }
    );

    (await cookies()).set("auth_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      message: "Nome de usuário atualizado com sucesso.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
