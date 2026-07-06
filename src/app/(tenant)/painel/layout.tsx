import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await db.tenantMember.findFirst({
    where: { userId: session.user.id, role: "ADMIN" },
    include: { tenant: true },
  })

  if (!membership) redirect("/dashboard")

  const tenant = membership.tenant

  const navItems = [
    { href: "/painel", label: "Dashboard", icon: "📊" },
    { href: "/painel/boloes", label: "Meus Bolões", icon: "🎰" },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ background: tenant.primaryColor }} />
            <span className="font-black text-sm text-white truncate">{tenant.name}</span>
          </div>
          <div className="text-xs text-zinc-500">Painel do organizador</div>
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
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors block">
            ← Meus bolões
          </Link>
          {session.user.isSuperadmin && (
            <Link href="/admin" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors block">
              ⚙ Super admin
            </Link>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
