import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 })
  }

  const { id } = await params
  const { homeScore, awayScore, status } = await req.json()

  const match = await db.match.update({
    where: { id },
    data: {
      homeScore: homeScore ?? null,
      awayScore: awayScore ?? null,
      status: status ?? "FINISHED",
    },
  })

  return NextResponse.json(match)
}
