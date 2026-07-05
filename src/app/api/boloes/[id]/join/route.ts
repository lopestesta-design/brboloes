import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const { id: bolaoId } = await params

  const bolao = await db.bolao.findUnique({ where: { id: bolaoId } })
  if (!bolao || !bolao.active) return NextResponse.json({ error: "Bolão não encontrado." }, { status: 404 })

  const existing = await db.participation.findUnique({
    where: { bolaoId_userId: { bolaoId, userId: session.user.id } },
  })
  if (existing) return NextResponse.json(existing)

  const gratuito = Number(bolao.entryFee) === 0

  const participation = await db.participation.create({
    data: {
      bolaoId,
      userId: session.user.id,
      paid: gratuito,
      paidAt: gratuito ? new Date() : null,
    },
  })

  // Adiciona ao tenant como MEMBER
  const tenant = await db.tenant.findUnique({ where: { id: bolao.tenantId } })
  if (tenant) {
    await db.tenantMember.upsert({
      where: { tenantId_userId: { tenantId: bolao.tenantId, userId: session.user.id } },
      create: { tenantId: bolao.tenantId, userId: session.user.id, role: "MEMBER" },
      update: {},
    })
  }

  return NextResponse.json(participation, { status: 201 })
}
