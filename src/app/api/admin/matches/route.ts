import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 })
  }

  const { seasonId, homeTeamId, awayTeamId, stage, round, kickoffAt } = await req.json()

  if (!seasonId || !homeTeamId || !awayTeamId || !stage || !kickoffAt) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 })
  }

  if (homeTeamId === awayTeamId) {
    return NextResponse.json({ error: "Os dois times não podem ser iguais." }, { status: 400 })
  }

  const match = await db.match.create({
    data: {
      seasonId,
      homeTeamId,
      awayTeamId,
      stage,
      round: round ?? null,
      kickoffAt: new Date(kickoffAt),
      status: "SCHEDULED",
    },
  })

  return NextResponse.json(match, { status: 201 })
}
