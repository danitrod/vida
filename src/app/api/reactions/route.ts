import { NextResponse } from "next/server";
import mongo from "@/lib/mongodb";
import { validateAuth, validateAnonToken, createAnonToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { post } = await req.json();
    if (!post) {
      return NextResponse.json(
        { message: "Post slug é obrigatório." },
        { status: 400 }
      );
    }

    const user = await validateAuth();
    let anonToken;
    if (!user) {
      anonToken = await validateAnonToken();
      if (!anonToken) {
        anonToken = await createAnonToken();
      }
    }

    const identifierQuery = user ? { user: user.username } : { anonToken };

    await mongo.connect();
    const db = mongo.db();
    const reactions = db.collection("reactions");

    const existing = await reactions.findOne({
      post,
      type: "love",
      ...identifierQuery,
    });

    if (existing) {
      await reactions.deleteOne({ _id: existing._id });
      return NextResponse.json({ success: true, loved: false });
    } else {
      await reactions.insertOne({
        post,
        type: "love",
        ...identifierQuery,
        createdAt: new Date(),
      });
      return NextResponse.json({ success: true, loved: true });
    }
  } catch (err) {
    console.error("Erro em toggle reaction:", err);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
