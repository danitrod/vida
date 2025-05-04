import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { anonCookie } from "./cookies";

const thirtyDaysSeconds = 60 * 60 * 24 * 30;

type User = {
  username: string;
  email: string;
};

export const validateAuth = async (): Promise<User | null> => {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded === "object" && decoded !== null && "user" in decoded) {
      return {
        username: (decoded as any).user.username,
        email: (decoded as any).user.email,
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
    expiresIn: "30d",
  });

  (await cookies()).set(anonCookie, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: thirtyDaysSeconds,
  });

  return uid;
};

export const validateAnonToken = async (): Promise<string | null> => {
  const token = (await cookies()).get(anonCookie)?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.anon && decoded.uid) {
      return decoded.uid;
    }
  } catch (err) {
    console.error("Anon token invalid:", err);
    return null;
  }

  return null;
};
