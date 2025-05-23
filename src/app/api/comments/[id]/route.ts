import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/mongodb";
import { validateAnonToken, validateAuth } from "@/lib/auth";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const user = await validateAuth();
    let anonToken;

    if (!user) {
      anonToken = await validateAnonToken();
      if (!anonToken) {
        return NextResponse.json(
          { message: "Não autenticado" },
          { status: 401 }
        );
      }
    }

    await mongo.connect();
    const db = mongo.db();
    const comments = db.collection("comments");

    const comment = await comments.findOne({ _id: new ObjectId(id) });
    if (!comment)
      return NextResponse.json(
        { message: "Comentário não encontrado" },
        { status: 404 }
      );

    if (
      (user && comment.author !== user.username) ||
      (!user && comment.anonToken !== anonToken)
    ) {
      return NextResponse.json({ message: "Sem permissão" }, { status: 403 });
    }

    await comments.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const user = await validateAuth();
    let anonToken;
    if (!user) {
      anonToken = await validateAnonToken();
      if (!anonToken) {
        return NextResponse.json(
          { message: "Não autenticado" },
          { status: 401 }
        );
      }
    }

    const { content } = await req.json();

    await mongo.connect();
    const db = mongo.db();
    const comments = db.collection("comments");

    const comment = await comments.findOne({ _id: new ObjectId(id) });
    if (!comment)
      return NextResponse.json(
        { message: "Comentário não encontrado" },
        { status: 404 }
      );
    if (
      (user && comment.author !== user.username) ||
      (!user && comment.anonToken !== anonToken)
    ) {
      return NextResponse.json({ message: "Sem permissão" }, { status: 403 });
    }

    await comments.updateOne(
      { _id: new ObjectId(id) },
      { $set: { content, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
