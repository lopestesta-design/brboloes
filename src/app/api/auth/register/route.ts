import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, nickname, email, whatsapp, password } = body

  if (!name || !nickname || !email || !password) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 })
  }

  const exists = await db.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.user.create({
    data: { name, nickname, email, whatsapp: whatsapp || null, passwordHash },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
