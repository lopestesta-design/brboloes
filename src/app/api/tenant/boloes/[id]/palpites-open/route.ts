import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notifyPalpitesOpen } from "@/lib/whatsapp"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const membership = await db.tenantMember.findFirst({
    where: { userId: session.user.id, role: "ADMIN" },
  })
  if (!membership) return NextResponse.json({ error: "Não autorizado." }, { status: 403 })

  const { id: bolaoId } = await params
  const { palpitesOpen } = await req.json()

  const bolao = await db.bolao.findFirst({
    where: { id: bolaoId, tenantId: membership.tenantId },
  })
  if (!bolao) return NextResponse.json({ error: "Bolão não encontrado." }, { status: 404 })

  const updated = await db.bolao.update({
    where: { id: bolaoId },
    data: { palpitesOpen },
  })

  // Notifica participantes pagos quando abre
  if (palpitesOpen) {
    const platformUrl = process.env.NEXTAUTH_URL ?? "https://bolao.appbarcontrol.com.br"
    const participations = await db.participation.findMany({
      where: { bolaoId, paid: true },
      include: { user: { select: { name: true, whatsapp: true } } },
    })
    for (const p of participations) {
      notifyPalpitesOpen({
        phone: p.user.whatsapp,
        name: p.user.name,
        bolaoName: bolao.name,
        platformUrl,
        bolaoId,
      })
    }
  }

  return NextResponse.json(updated)
}
