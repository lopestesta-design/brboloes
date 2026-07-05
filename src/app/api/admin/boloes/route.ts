import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { nanoid } from "nanoid"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isSuperadmin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 })

  const boloes = await db.bolao.findMany({
    include: { tenant: true, season: { include: { competition: true } }, _count: { select: { participations: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(boloes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 })

  const { tenantId, seasonId, name, entryFee, prizePct } = await req.json()

  if (!tenantId || !seasonId || !name) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 })
  }

  const bolao = await db.bolao.create({
    data: {
      tenantId,
      seasonId,
      name,
      entryFee: parseFloat(entryFee) || 0,
      prizePct: parseFloat(prizePct) || 70,
      inviteSlug: nanoid(10),
    },
  })

  return NextResponse.json(bolao, { status: 201 })
}
