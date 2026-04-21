import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== process.env.DEMO_PASSWORD) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set("hvac-demo-auth", "authenticated", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
