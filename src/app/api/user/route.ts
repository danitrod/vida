import { NextResponse } from "next/server";
import mongo from "@/lib/mongodb";
import { validateUsername } from "@/lib/validation";
import { authorize, validateAuth } from "@/lib/auth";

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

    await users.updateOne(
      { email: currentEmail },
      { $set: { username, updatedAt: new Date() } }
    );

    await db
      .collection("comments")
      .updateMany(
        { author: currentUsername },
        { $set: { author: username, updatedAt: new Date() } }
      );

    await db
      .collection("reactions")
      .updateMany(
        { user: currentUsername },
        { $set: { user: username, updatedAt: new Date() } }
      );

    await authorize({ username, email: currentEmail });
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
