import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  const valid = ["DRAFT", "ACTIVE", "FINISHED"]
  if (!valid.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 })
  }

  const season = await db.season.update({ where: { id }, data: { status } })
  return NextResponse.json(season)
}
