import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isSuperadmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 })
  }

  const teams = await db.team.findMany({
    orderBy: [{ country: "asc" }, { name: "asc" }],
    select: { id: true, name: true, shortName: true, country: true },
  })

  return NextResponse.json(teams)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 })
  }

  const { name, shortName, country, logoUrl } = await req.json()

  if (!name || !shortName || !country) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 })
  }

  const team = await db.team.create({
    data: { name, shortName, country, logoUrl: logoUrl || null },
  })

  return NextResponse.json(team, { status: 201 })
}
