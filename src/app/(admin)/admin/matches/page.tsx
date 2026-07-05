import { db } from "@/lib/db"
import Link from "next/link"

export default async function MatchesPage() {
  const matches = await db.match.findMany({
    include: { homeTeam: true, awayTeam: true, season: { include: { competition: true } } },
    orderBy: { kickoffAt: "desc" },
    take: 50,
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Jogos</h1>
          <p className="text-zinc-400 text-sm mt-1">Últimos {matches.length} jogos</p>
        </div>
        <Link
          href="/admin/matches/novo"
          className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + Novo jogo
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-4">🎮</p>
          <p>Nenhum jogo cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/admin/matches/${m.id}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 flex items-center gap-4 transition-colors"
            >
              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-1">{m.season.competition.name} {m.season.year} · {m.stage}</p>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white text-sm">{m.homeTeam.name}</span>
                  {m.homeScore !== null ? (
                    <span className="text-green-400 font-black">{m.homeScore} × {m.awayScore}</span>
                  ) : (
                    <span className="text-zinc-600 text-xs">×</span>
                  )}
                  <span className="font-semibold text-white text-sm">{m.awayTeam.name}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">
                  {new Date(m.kickoffAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  m.status === "FINISHED" ? "bg-blue-900 text-blue-400" :
                  m.status === "LIVE" ? "bg-red-900 text-red-400" :
                  "bg-zinc-800 text-zinc-400"
                }`}>
                  {m.status === "FINISHED" ? "Enc." : m.status === "LIVE" ? "Ao vivo" : "Agend."}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
