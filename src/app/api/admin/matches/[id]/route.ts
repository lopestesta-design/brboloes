import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { calcularPontos } from "@/lib/scoring"

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

  // Calcula pontos para todos os palpites desse jogo
  if (homeScore !== null && awayScore !== null) {
    const palpites = await db.palpite.findMany({
      where: { matchId: id },
      include: { participation: { include: { bolao: true } } },
    })

    for (const palpite of palpites) {
      const config = palpite.participation.bolao.scoringConfig as {
        exact: number; result: number; wrong: number
      }
      const points = calcularPontos(homeScore, awayScore, palpite.homeScore, palpite.awayScore, config)
      await db.palpite.update({ where: { id: palpite.id }, data: { points } })
    }

    // Atualiza totalPoints de cada participação afetada
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

    // Atualiza ranking dentro de cada bolão afetado
    const bolaoIds = [...new Set(palpites.map((p) => p.participation.bolaoId))]
    for (const bolaoId of bolaoIds) {
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
    }
  }

  return NextResponse.json(match)
}
