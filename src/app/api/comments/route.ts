import { NextResponse } from "next/server";
import mongo from "@/lib/mongodb";
import { createAnonToken, validateAnonToken, validateAuth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ message: "Missing slug" }, { status: 400 });
  }

  await mongo.connect();
  const db = mongo.db();
  const comments = await db
    .collection("comments")
    .find({ slug })
    .sort({ createdAt: -1 })
    .toArray();

  const sanitized = comments.map(({ _id, ...rest }: { _id: any }) => ({
    _id: _id.toString(),
    ...rest,
  }));

  return NextResponse.json({ comments: sanitized });
}

export async function POST(req: Request) {
  try {
    const { slug, content, authorName } = await req.json();

    if (!slug || !content || content.trim().length === 0) {
      return NextResponse.json(
        { message: "Slug e conteúdo são obrigatórios." },
        { status: 400 }
      );
    }

    const user = await validateAuth();
    let author = authorName;
    let anonToken;
    if (user) {
      author = user.username;
    } else {
      anonToken = await validateAnonToken();
      if (!anonToken) {
        anonToken = await createAnonToken();
      }
    }

    await mongo.connect();
    const db = mongo.db();
    const comments = db.collection("comments");

    await comments.insertOne({
      slug,
      content,
      author,
      anonToken,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro ao adicionar comentário." },
      { status: 500 }
    );
  }
}
