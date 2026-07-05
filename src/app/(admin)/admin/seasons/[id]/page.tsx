import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { SeasonActions } from "./SeasonActions"

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

export default async function SeasonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const season = await db.season.findUnique({
    where: { id },
    include: {
      competition: true,
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: { kickoffAt: "asc" },
      },
    },
  })

  if (!season) notFound()

  const groupedMatches = season.matches.reduce<Record<string, typeof season.matches>>((acc, m) => {
    const key = m.stage
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <Link href="/admin/seasons" className="text-xs text-zinc-500 hover:text-zinc-300">← Temporadas</Link>
          <h1 className="text-2xl font-bold text-white mt-1">
            {season.competition.name} {season.year}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusColor[season.status]}`}>
            {statusLabel[season.status]}
          </span>
          <SeasonActions seasonId={season.id} status={season.status} />
        </div>
      </div>

      <div className="flex gap-4 text-sm text-zinc-500 mb-8">
        <span>{season.matches.length} jogos</span>
        {season.startDate && <span>Início: {new Date(season.startDate).toLocaleDateString("pt-BR")}</span>}
        {season.endDate && <span>Fim: {new Date(season.endDate).toLocaleDateString("pt-BR")}</span>}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Jogos</h2>
        <Link
          href={`/admin/matches/novo?seasonId=${season.id}`}
          className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + Adicionar jogo
        </Link>
      </div>

      {season.matches.length === 0 ? (
        <div className="text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
          <p>Nenhum jogo cadastrado ainda.</p>
          <Link href={`/admin/matches/novo?seasonId=${season.id}`} className="text-green-400 hover:underline text-sm mt-2 inline-block">
            Adicionar o primeiro jogo →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMatches).map(([stage, matches]) => (
            <div key={stage}>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{stage}</h3>
              <div className="space-y-2">
                {matches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/admin/matches/${m.id}`}
                    className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 justify-center">
                      <span className="text-sm font-semibold text-white text-right flex-1">{m.homeTeam.name}</span>
                      <div className="text-center px-4">
                        {m.homeScore !== null && m.awayScore !== null ? (
                          <span className="text-lg font-black text-green-400">{m.homeScore} × {m.awayScore}</span>
                        ) : (
                          <span className="text-xs text-zinc-600">
                            {new Date(m.kickoffAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-white flex-1">{m.awayTeam.name}</span>
                    </div>
                    <span className={`ml-4 text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                      m.status === "FINISHED" ? "bg-blue-900 text-blue-400" :
                      m.status === "LIVE" ? "bg-red-900 text-red-400" :
                      m.status === "CANCELLED" ? "bg-zinc-800 text-zinc-500" :
                      "bg-zinc-800 text-zinc-400"
                    }`}>
                      {m.status === "FINISHED" ? "Enc." : m.status === "LIVE" ? "Ao vivo" : m.status === "CANCELLED" ? "Cancel." : "Agend."}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
