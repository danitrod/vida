import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import mongo from "@/lib/mongodb";
import { validateAuth } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await validateAuth();

    if (!user) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    await mongo.connect();
    const db = mongo.db();
    const comments = db.collection("comments");

    const comment = await comments.findOne({ _id: new ObjectId(params.id) });
    if (!comment)
      return NextResponse.json(
        { message: "Comentário não encontrado" },
        { status: 404 }
      );

    if (comment.author !== user.username) {
      return NextResponse.json({ message: "Sem permissão" }, { status: 403 });
    }

    await comments.deleteOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await validateAuth();
    if (!user) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const { content } = await req.json();

    await mongo.connect();
    const db = mongo.db();
    const comments = db.collection("comments");

    const result = await comments.updateOne(
      { _id: new ObjectId(params.id), author: user.username },
      { $set: { content } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Comentário não encontrado ou sem permissão" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
