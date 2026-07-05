import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const { id: bolaoId } = await params
  const { participationId, palpites } = await req.json()

  const bolao = await db.bolao.findUnique({ where: { id: bolaoId } })
  if (!bolao?.palpitesOpen) return NextResponse.json({ error: "Palpites fechados." }, { status: 403 })

  const agora = new Date()

  for (const p of palpites as { matchId: string; homeScore: number; awayScore: number }[]) {
    const match = await db.match.findUnique({ where: { id: p.matchId } })
    if (!match || match.status !== "SCHEDULED" || match.kickoffAt <= agora) continue

    await db.palpite.upsert({
      where: { participationId_matchId: { participationId, matchId: p.matchId } },
      create: { participationId, matchId: p.matchId, homeScore: p.homeScore, awayScore: p.awayScore },
      update: { homeScore: p.homeScore, awayScore: p.awayScore },
    })
  }

  return NextResponse.json({ ok: true })
}
