import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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
