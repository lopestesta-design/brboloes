import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { CompetitionFormat } from "@prisma/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isSuperadmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 })
  }

  const competitions = await db.competition.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, shortName: true },
  })

  return NextResponse.json(competitions)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 })
  }

  const { name, shortName, country, logoUrl, formatType } = await req.json()

  if (!name || !shortName || !country || !formatType) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 })
  }

  if (!Object.values(CompetitionFormat).includes(formatType)) {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 })
  }

  const competition = await db.competition.create({
    data: { name, shortName, country, logoUrl: logoUrl || null, formatType },
  })

  return NextResponse.json(competition, { status: 201 })
}
