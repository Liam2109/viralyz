import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getOrCreateDbUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const supabaseUser = await getAuthUser(request);
  if (!supabaseUser) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const dbUser = await getOrCreateDbUser(supabaseUser);
  if (!dbUser) {
    return NextResponse.json({ error: "Impossible de créer l'utilisateur." }, { status: 500 });
  }

  return NextResponse.json({ user: dbUser });
}
