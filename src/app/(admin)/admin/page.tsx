import { db } from "@/lib/db"

export default async function AdminDashboard() {
  const [tenants, users, competitions, seasons, teams, matches] = await Promise.all([
    db.tenant.count(),
    db.user.count(),
    db.competition.count(),
    db.season.count(),
    db.team.count(),
    db.match.count(),
  ])

  const boloes = await db.bolao.count()
  const participations = await db.participation.count()

  const stats = [
    { label: "Tenants", value: tenants, icon: "🏢", href: "/admin/tenants" },
    { label: "Usuários", value: users, icon: "👤", href: "#" },
    { label: "Competições", value: competitions, icon: "🏆", href: "/admin/competitions" },
    { label: "Temporadas", value: seasons, icon: "📅", href: "/admin/seasons" },
    { label: "Times", value: teams, icon: "⚽", href: "/admin/teams" },
    { label: "Jogos", value: matches, icon: "🎮", href: "/admin/matches" },
    { label: "Bolões", value: boloes, icon: "🎰", href: "#" },
    { label: "Participações", value: participations, icon: "🙋", href: "#" },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-zinc-400 text-sm mb-8">Visão geral da plataforma</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors"
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="text-sm text-zinc-400 mt-1">{s.label}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
