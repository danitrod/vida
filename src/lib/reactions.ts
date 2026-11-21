import mongo from "@/lib/mongodb";
import { validateAuth, validateAnonToken } from "@/lib/auth";

export type LoveState = { count: number; loved: boolean };

// Heart count for a post, and whether the current visitor (logged-in user,
// or anonymous token when logged out) has loved it.
export async function getLoveState(post: string): Promise<LoveState> {
  await mongo.connect();
  const reactions = mongo.db().collection("reactions");

  const user = await validateAuth();
  const identifier = user
    ? { user: user.username }
    : { anonToken: await validateAnonToken() };

  const [count, own] = await Promise.all([
    reactions.countDocuments({ post, type: "love" }),
    identifier.user || identifier.anonToken
      ? reactions.findOne({ post, type: "love", ...identifier })
      : null,
  ]);

  return { count, loved: own !== null };
}
