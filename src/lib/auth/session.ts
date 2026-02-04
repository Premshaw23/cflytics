import "server-only";

import type { SessionOptions } from "iron-session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type AuthSessionUser = {
  id: string;
  handle: string;
};

export type AuthSession = {
  user?: AuthSessionUser;
};

function requireSessionPassword(): string {
  const password = process.env.CFLYTICS_SESSION_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ WARNING: CFLYTICS_SESSION_PASSWORD is missing. Using a fallback for build/production. Set this var in your environment!");
    }
    return "J8b4n7s9L2m5q1r3t6w8z0x2v4n6k8j0d3f5h7g9s1a3"; // 32+ chars fallback
  }
  return password;
}

export const sessionOptions: SessionOptions = {
  cookieName: "cflytics_session",
  password: requireSessionPassword(),
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    path: "/",
  },
};

export async function getAuthSession() {
  return getIronSession<AuthSession>(await cookies(), sessionOptions);
}

export async function requireAuthUser() {
  const session = await getAuthSession();
  if (!session.user) return null;
  return session.user;
}

