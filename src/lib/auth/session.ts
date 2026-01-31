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
  const password = process.env.CODEY_SESSION_PASSWORD;
  if (!password) {
    throw new Error(
      "Missing CODEY_SESSION_PASSWORD. Add a long random string to .env.local (at least 32 chars)."
    );
  }
  return password;
}

export const sessionOptions: SessionOptions = {
  cookieName: "codey_session",
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

