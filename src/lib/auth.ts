import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { anonCookie } from "./cookies";
import { User } from "@/types/user";

const semesterSeconds = 60 * 60 * 24 * 180;
const ninetyDaysSeconds = 60 * 60 * 24 * 90;

export const authorize = async (user: User) => {
  const token = jwt.sign(
    { user: { username: user.username, email: user.email } },
    process.env.JWT_SECRET!,
    { expiresIn: "180d" }
  );

  (await cookies()).set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: semesterSeconds,
  });
};

export const validateAuth = async (): Promise<User | null> => {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded === "object" && decoded !== null && "user" in decoded) {
      return {
        username: (decoded as { user: User }).user.username,
        email: (decoded as { user: User }).user.email,
      };
    }
  } catch (err) {
    console.error("JWT validation error:", err);
    return null;
  }

  return null;
};

export const createAnonToken = async (): Promise<string> => {
  const uid = uuidv4();
  const token = jwt.sign({ anon: true, uid }, process.env.JWT_SECRET!, {
    expiresIn: "90d",
  });

  (await cookies()).set(anonCookie, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ninetyDaysSeconds,
  });

  return uid;
};

export const validateAnonToken = async (): Promise<string | null> => {
  const token = (await cookies()).get(anonCookie)?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      anon: boolean;
      uid: string;
    };
    if (decoded.anon && decoded.uid) {
      return decoded.uid;
    }
  } catch (err) {
    console.error("Anon token invalid:", err);
    return null;
  }

  return null;
};
