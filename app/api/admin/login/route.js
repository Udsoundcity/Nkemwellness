import { NextResponse } from "next/server";
import { createSessionToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from "@/lib/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { username, password } = body || {};
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

   if (!expectedUsername||!expectedPassword) {
  console.error("ADMIN_USERNAME / ADMIN_PASSWORD are not configured.");
  return NextResponse.json(
    { error: "Admin login is not configured." },
    { status: 500 }
  );
}

  if (!username||!password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const usernameMatches = username === expectedUsername;
const passwordMatches = usernameMatches && password === expectedPassword;

   if (!usernameMatches||!passwordMatches) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE
  });
  return res;
}
