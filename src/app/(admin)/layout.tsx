import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/tenants", label: "Tenants", icon: "🏢" },
  { href: "/admin/competitions", label: "Competições", icon: "🏆" },
  { href: "/admin/seasons", label: "Temporadas", icon: "📅" },
  { href: "/admin/teams", label: "Times", icon: "⚽" },
  { href: "/admin/matches", label: "Jogos", icon: "🎮" },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.isSuperadmin) redirect("/dashboard")

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-zinc-800">
          <span className="font-black text-lg text-green-400">BRbolões</span>
          <div className="text-xs text-zinc-500 mt-0.5">Super Admin</div>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Voltar à plataforma
          </Link>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto bg-zinc-950">
        {children}
      </main>
    </div>
  )
}
