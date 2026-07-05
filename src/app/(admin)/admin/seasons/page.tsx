import { db } from "@/lib/db"
import Link from "next/link"

const statusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Em andamento",
  FINISHED: "Finalizada",
}

const statusColor: Record<string, string> = {
  DRAFT: "bg-zinc-800 text-zinc-400",
  ACTIVE: "bg-green-900 text-green-400",
  FINISHED: "bg-blue-900 text-blue-400",
}

export default async function SeasonsPage() {
  const seasons = await db.season.findMany({
    include: {
      competition: true,
      _count: { select: { matches: true, boloes: true } },
    },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Temporadas</h1>
          <p className="text-zinc-400 text-sm mt-1">{seasons.length} cadastrada(s)</p>
        </div>
        <Link
          href="/admin/seasons/nova"
          className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + Nova temporada
        </Link>
      </div>

      {seasons.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-4">📅</p>
          <p>Nenhuma temporada cadastrada.</p>
          <Link href="/admin/seasons/nova" className="text-green-400 hover:underline text-sm mt-2 inline-block">
            Criar a primeira →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {seasons.map((s) => (
            <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{s.competition.name} {s.year}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {s._count.matches} jogos · {s._count.boloes} bolões
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor[s.status]}`}>
                  {statusLabel[s.status]}
                </span>
                <Link
                  href={`/admin/seasons/${s.id}`}
                  className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Gerenciar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
