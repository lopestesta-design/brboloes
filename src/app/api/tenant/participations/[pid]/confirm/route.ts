import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ pid: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const membership = await db.tenantMember.findFirst({
    where: { userId: session.user.id, role: "ADMIN" },
  })
  if (!membership) return NextResponse.json({ error: "Não autorizado." }, { status: 403 })

  const { pid } = await params

  // Verifica que a participation pertence a um bolão do tenant
  const participation = await db.participation.findFirst({
    where: {
      id: pid,
      bolao: { tenantId: membership.tenantId },
    },
  })
  if (!participation) return NextResponse.json({ error: "Participação não encontrada." }, { status: 404 })

  const updated = await db.participation.update({
    where: { id: pid },
    data: { paid: true, paidAt: new Date() },
  })

  return NextResponse.json(updated)
}
