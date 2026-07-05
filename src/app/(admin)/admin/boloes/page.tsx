import { db } from "@/lib/db"
import Link from "next/link"

export default async function BoloesAdminPage() {
  const boloes = await db.bolao.findMany({
    include: {
      tenant: true,
      season: { include: { competition: true } },
      _count: { select: { participations: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Bolões</h1>
          <p className="text-zinc-400 text-sm mt-1">{boloes.length} bolão(ões)</p>
        </div>
        <Link href="/admin/boloes/novo" className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
          + Novo bolão
        </Link>
      </div>

      {boloes.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-4">🎰</p>
          <p>Nenhum bolão criado ainda.</p>
          <Link href="/admin/boloes/novo" className="text-green-400 hover:underline text-sm mt-2 inline-block">Criar o primeiro →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {boloes.map((b) => (
            <Link key={b.id} href={`/admin/boloes/${b.id}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 flex items-center justify-between transition-colors">
              <div>
                <p className="font-semibold text-white">{b.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {b.season.competition.name} {b.season.year} · {b.tenant.name} · {b._count.participations} participantes
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.palpitesOpen ? "bg-green-900 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
                  {b.palpitesOpen ? "Aberto" : "Fechado"}
                </span>
                <span className="text-xs text-zinc-400 font-mono">R$ {Number(b.entryFee).toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
