import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { calcularPontos } from "@/lib/scoring"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const membership = await db.tenantMember.findFirst({
    where: { userId: session.user.id, role: "ADMIN" },
  })
  if (!membership) return NextResponse.json({ error: "Não autorizado." }, { status: 403 })

  const { id } = await params
  const { homeScore, awayScore, bolaoId } = await req.json()

  // Verifica que o bolão pertence ao tenant
  const bolao = await db.bolao.findFirst({
    where: { id: bolaoId, tenantId: membership.tenantId },
  })
  if (!bolao) return NextResponse.json({ error: "Bolão não encontrado." }, { status: 404 })

  const match = await db.match.update({
    where: { id },
    data: { homeScore, awayScore, status: "FINISHED" },
  })

  // Calcula pontos dos palpites deste bolão para este jogo
  const config = bolao.scoringConfig as { exact: number; result: number; wrong: number }

  const palpites = await db.palpite.findMany({
    where: {
      matchId: id,
      participation: { bolaoId },
    },
    include: { participation: true },
  })

  for (const palpite of palpites) {
    const points = calcularPontos(homeScore, awayScore, palpite.homeScore, palpite.awayScore, config)
    await db.palpite.update({ where: { id: palpite.id }, data: { points } })
  }

  // Atualiza totalPoints
  const participationIds = [...new Set(palpites.map((p) => p.participationId))]
  for (const participationId of participationIds) {
    const total = await db.palpite.aggregate({
      where: { participationId },
      _sum: { points: true },
    })
    await db.participation.update({
      where: { id: participationId },
      data: { totalPoints: total._sum.points ?? 0 },
    })
  }

  // Atualiza ranking
  const participations = await db.participation.findMany({
    where: { bolaoId },
    orderBy: { totalPoints: "desc" },
  })
  for (let i = 0; i < participations.length; i++) {
    await db.participation.update({
      where: { id: participations[i].id },
      data: { rankPrev: participations[i].rankPosition, rankPosition: i + 1 },
    })
  }

  return NextResponse.json(match)
}
