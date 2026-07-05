import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 })

  const { participationId, paid } = await req.json()

  const participation = await db.participation.update({
    where: { id: participationId },
    data: { paid, paidAt: paid ? new Date() : null },
  })

  return NextResponse.json(participation)
}
