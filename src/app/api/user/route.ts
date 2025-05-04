import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongo from "@/lib/mongodb";
import { validateUsername } from "@/lib/validation";
import { validateAuth } from "@/lib/auth";

export async function PATCH(req: Request) {
  const user = await validateAuth();
  if (!user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const currentEmail = user.email;
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
      email: { $ne: currentEmail },
    });

    if (taken) {
      return NextResponse.json(
        { message: "Este nome de usuário já está em uso." },
        { status: 409 }
      );
    }

    await users.updateOne({ email: currentEmail }, { $set: { username } });

    await db
      .collection("comments")
      .updateMany({ author: currentUsername }, { $set: { author: username } });

    await db
      .collection("reactions")
      .updateMany({ user: currentUsername }, { $set: { user: username } });

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
