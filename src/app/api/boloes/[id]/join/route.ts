import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { upsertCustomer, createPixCharge, getPixQrCode } from "@/lib/asaas"

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
  await db.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: bolao.tenantId, userId: session.user.id } },
    create: { tenantId: bolao.tenantId, userId: session.user.id, role: "MEMBER" },
    update: {},
  })

  // Se bolão pago, gera cobrança PIX no Asaas
  if (!gratuito) {
    try {
      const user = await db.user.findUnique({ where: { id: session.user.id } })
      if (!user) throw new Error("Usuário não encontrado")

      const customer = await upsertCustomer({ name: user.name, email: user.email })

      const charge = await createPixCharge({
        customerId: customer.id,
        value: Number(bolao.entryFee),
        description: `Entrada: ${bolao.name}`,
        externalReference: participation.id,
      })

      const qrCode = await getPixQrCode(charge.id)

      await db.participation.update({
        where: { id: participation.id },
        data: {
          asaasChargeId: charge.id,
          asaasCustomerId: customer.id,
          invoiceUrl: charge.invoiceUrl,
        },
      })

      return NextResponse.json(
        {
          ...participation,
          asaasChargeId: charge.id,
          invoiceUrl: charge.invoiceUrl,
          pixQrCode: qrCode.encodedImage,
          pixCode: qrCode.payload,
          pixExpiration: qrCode.expirationDate,
        },
        { status: 201 }
      )
    } catch (err) {
      console.error("Erro ao criar cobrança Asaas:", err)
      // Não bloqueia a participação — admin pode confirmar manualmente
    }
  }

  return NextResponse.json(participation, { status: 201 })
}
