import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Eventos que indicam pagamento confirmado
const PAID_EVENTS = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"])

export async function POST(req: NextRequest) {
  // Valida token se configurado
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN
  if (webhookToken) {
    const incomingToken = req.headers.get("asaas-access-token")
    if (incomingToken !== webhookToken) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 })
    }
  }

  let body: { event: string; payment?: { id: string; externalReference?: string; status: string } }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
  }

  const { event, payment } = body

  if (!PAID_EVENTS.has(event) || !payment) {
    // Evento não relevante — responde 200 para o Asaas parar de reenviar
    return NextResponse.json({ ok: true })
  }

  // Busca participation pelo externalReference (id da participation)
  // ou pelo asaasChargeId como fallback
  const participationId = payment.externalReference
  const chargeId = payment.id

  const participation = await db.participation.findFirst({
    where: participationId
      ? { id: participationId }
      : { asaasChargeId: chargeId },
  })

  if (!participation) {
    console.warn("Webhook Asaas: participation não encontrada para charge", chargeId)
    return NextResponse.json({ ok: true })
  }

  if (participation.paid) {
    // Já estava pago — idempotente
    return NextResponse.json({ ok: true })
  }

  await db.participation.update({
    where: { id: participation.id },
    data: { paid: true, paidAt: new Date() },
  })

  console.log(`Pagamento confirmado via Asaas: participation ${participation.id}`)
  return NextResponse.json({ ok: true })
}
