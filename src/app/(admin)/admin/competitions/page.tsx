import { db } from "@/lib/db"
import Link from "next/link"

const formatLabel: Record<string, string> = {
  LIGA: "Liga",
  GRUPOS_MATA: "Grupos + Mata-mata",
  COPA_MATA: "Copa / Mata-mata",
  LIGA_MATA: "Liga + Mata-mata",
}

export default async function CompetitionsPage() {
  const competitions = await db.competition.findMany({
    include: { _count: { select: { seasons: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Competições</h1>
          <p className="text-zinc-400 text-sm mt-1">{competitions.length} cadastrada(s)</p>
        </div>
        <Link
          href="/admin/competitions/nova"
          className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + Nova competição
        </Link>
      </div>

      {competitions.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-4">🏆</p>
          <p>Nenhuma competição cadastrada.</p>
          <Link href="/admin/competitions/nova" className="text-green-400 hover:underline text-sm mt-2 inline-block">
            Criar a primeira →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {competitions.map((c) => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={c.name} className="w-10 h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-xl">🏆</div>
                )}
                <div>
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-zinc-500">
                    {c.shortName} · {c.country} · {formatLabel[c.formatType]} · {c._count.seasons} temporada(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.active ? "bg-green-900 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
                  {c.active ? "Ativa" : "Inativa"}
                </span>
                <Link
                  href={`/admin/competitions/${c.id}`}
                  className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
