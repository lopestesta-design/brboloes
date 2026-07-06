import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, nickname: true, email: true, whatsapp: true },
  })

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const { name, nickname, whatsapp } = await req.json()

  if (!name?.trim() || !nickname?.trim()) {
    return NextResponse.json({ error: "Nome e apelido são obrigatórios." }, { status: 400 })
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      name: name.trim(),
      nickname: nickname.trim(),
      whatsapp: whatsapp?.replace(/\D/g, "") || null,
    },
    select: { id: true, name: true, nickname: true, whatsapp: true },
  })

  return NextResponse.json(user)
}
