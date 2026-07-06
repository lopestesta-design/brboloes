import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PerfilForm } from "./PerfilForm"

export default async function PerfilPage() {
  const { user: sessionUser } = (await auth()) ?? {}
  if (!sessionUser?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { name: true, nickname: true, email: true, whatsapp: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="font-black text-white">Meu perfil</h1>
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">← Dashboard</Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <p className="text-xs text-zinc-600 mb-6">{user.email}</p>
        <PerfilForm name={user.name} nickname={user.nickname} whatsapp={user.whatsapp ?? ""} />
      </div>
    </div>
  )
}
