import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 })

  const { id } = await params
  const tenant = await db.tenant.findUnique({ where: { id } })
  if (!tenant) return NextResponse.json({ error: "Não encontrado." }, { status: 404 })

  return NextResponse.json(tenant)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 })

  const { id } = await params
  const { name, whatsapp, pixKey, primaryColor, commissionPct, active } = await req.json()

  const tenant = await db.tenant.update({
    where: { id },
    data: {
      name,
      whatsapp: whatsapp || null,
      pixKey: pixKey || null,
      primaryColor,
      commissionPct: parseFloat(commissionPct) || 5,
      active,
    },
  })

  return NextResponse.json(tenant)
}
