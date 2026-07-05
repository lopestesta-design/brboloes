import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isSuperadmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 })
  }

  const seasons = await db.season.findMany({
    where: { status: { in: ["DRAFT", "ACTIVE"] } },
    include: { competition: { select: { name: true } } },
    orderBy: [{ year: "desc" }],
  })

  return NextResponse.json(seasons)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 })
  }

  const { competitionId, year, startDate, endDate } = await req.json()

  if (!competitionId || !year) {
    return NextResponse.json({ error: "Competição e ano são obrigatórios." }, { status: 400 })
  }

  const exists = await db.season.findUnique({
    where: { competitionId_year: { competitionId, year: parseInt(year) } },
  })
  if (exists) {
    return NextResponse.json({ error: "Já existe uma temporada para essa competição nesse ano." }, { status: 409 })
  }

  const season = await db.season.create({
    data: {
      competitionId,
      year: parseInt(year),
      status: "DRAFT",
      formatConfig: {},
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  })

  return NextResponse.json(season, { status: 201 })
}
