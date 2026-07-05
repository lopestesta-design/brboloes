import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 })

  const { id } = await params
  const { palpitesOpen } = await req.json()

  const bolao = await db.bolao.update({ where: { id }, data: { palpitesOpen } })
  return NextResponse.json(bolao)
}
