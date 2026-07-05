import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 })
  }

  const { name, slug, whatsapp, pixKey, primaryColor, commissionPct } = await req.json()

  if (!name || !slug) {
    return NextResponse.json({ error: "Nome e slug são obrigatórios." }, { status: 400 })
  }

  const exists = await db.tenant.findUnique({ where: { slug } })
  if (exists) {
    return NextResponse.json({ error: "Slug já está em uso." }, { status: 409 })
  }

  const tenant = await db.tenant.create({
    data: {
      name,
      slug,
      whatsapp: whatsapp || null,
      pixKey: pixKey || null,
      primaryColor: primaryColor || "#16a34a",
      commissionPct: parseFloat(commissionPct) || 5,
    },
  })

  return NextResponse.json(tenant, { status: 201 })
}
