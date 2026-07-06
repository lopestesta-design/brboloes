import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function TenantDashboard() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await db.tenantMember.findFirst({
    where: { userId: session.user.id, role: "ADMIN" },
    include: { tenant: true },
  })
  if (!membership) redirect("/dashboard")

  const boloes = await db.bolao.findMany({
    where: { tenantId: membership.tenantId },
    include: {
      season: { include: { competition: true } },
      participations: {
        select: { paid: true, totalPoints: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = boloes.map((b) => {
    const total = b.participations.length
    const pagos = b.participations.filter((p) => p.paid).length
    const pendentes = total - pagos
    const premio = (pagos * Number(b.entryFee) * Number(b.prizePct)) / 100
    return { ...b, total, pagos, pendentes, premio }
  })

  const totalParticipantes = stats.reduce((s, b) => s + b.pagos, 0)
  const totalPendentes = stats.reduce((s, b) => s + b.pendentes, 0)
  const totalPremio = stats.reduce((s, b) => s + b.premio, 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">{membership.tenant.name}</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-3xl font-black text-white">{boloes.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Bolões ativos</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-3xl font-black text-white">{totalParticipantes}</p>
          <p className="text-xs text-zinc-500 mt-1">Participantes pagos</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-3xl font-black text-yellow-400">{totalPendentes}</p>
          <p className="text-xs text-zinc-500 mt-1">Pagamentos pendentes</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-3xl font-black text-green-400">R$ {totalPremio.toFixed(0)}</p>
          <p className="text-xs text-zinc-500 mt-1">Total em prêmios</p>
        </div>
      </div>

      {/* Lista de bolões */}
      <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Meus bolões</h2>

      {stats.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-4">🎰</p>
          <p>Nenhum bolão criado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stats.map((b) => (
            <Link
              key={b.id}
              href={`/painel/boloes/${b.id}`}
              className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-white">{b.name}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.palpitesOpen ? "bg-green-900 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
                      {b.palpitesOpen ? "Palpites abertos" : "Palpites fechados"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {b.season.competition.name} {b.season.year}
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0 text-right">
                  <div>
                    <p className="text-lg font-black text-white">{b.pagos}</p>
                    <p className="text-xs text-zinc-500">pagos</p>
                  </div>
                  {b.pendentes > 0 && (
                    <div>
                      <p className="text-lg font-black text-yellow-400">{b.pendentes}</p>
                      <p className="text-xs text-zinc-500">pendentes</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-green-400">R$ {b.premio.toFixed(0)}</p>
                    <p className="text-xs text-zinc-500">prêmio</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
