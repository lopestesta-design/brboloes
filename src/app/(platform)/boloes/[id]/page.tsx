import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(date))
}

function statusLabel(status: string) {
  if (status === "FINISHED") return { label: "Encerrado", cls: "text-zinc-500" }
  if (status === "LIVE") return { label: "Ao vivo", cls: "text-green-400" }
  return { label: "Agendado", cls: "text-zinc-400" }
}

export default async function BolaoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id: bolaoId } = await params

  const bolao = await db.bolao.findUnique({
    where: { id: bolaoId },
    include: {
      tenant: true,
      season: {
        include: {
          competition: true,
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: { kickoffAt: "asc" },
          },
        },
      },
      participations: {
        where: { paid: true },
        include: { user: { select: { id: true, nickname: true } } },
        orderBy: { totalPoints: "desc" },
        take: 5,
      },
      _count: { select: { participations: { where: { paid: true } } } },
    },
  })

  if (!bolao) notFound()

  const participation = await db.participation.findUnique({
    where: { bolaoId_userId: { bolaoId, userId: session.user.id } },
  })

  if (!participation) redirect(`/convite/${bolao.inviteSlug}`)

  // Busca palpites do usuário para os jogos dessa season
  const palpites = await db.palpite.findMany({
    where: { participationId: participation.id },
  })
  const palpiteMap = new Map(palpites.map((p) => [p.matchId, p]))

  const matches = bolao.season.matches
  const now = new Date()

  const upcoming = matches.filter((m) => m.status !== "FINISHED").slice(0, 5)
  const recent = matches.filter((m) => m.status === "FINISHED").slice(-5).reverse()

  const scoringConfig = bolao.scoringConfig as { exact: number; result: number; wrong: number }
  const prize = (Number(bolao.entryFee) * bolao._count.participations * Number(bolao.prizePct)) / 100
  const myPos = bolao.participations.findIndex((p) => p.userId === session.user.id) + 1

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">← Meus bolões</Link>
            <h1 className="font-black text-white text-lg mt-0.5">{bolao.name}</h1>
            <p className="text-xs text-zinc-500">{bolao.season.competition.name} {bolao.season.year} · {bolao.tenant.name}</p>
          </div>
          {!participation.paid && Number(bolao.entryFee) > 0 && (
            <span className="text-xs bg-yellow-900 text-yellow-400 font-bold px-3 py-1 rounded-full">Pagamento pendente</span>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-white">{participation.totalPoints}</p>
            <p className="text-xs text-zinc-500 mt-1">Seus pontos</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-white">
              {participation.rankPosition ? `${participation.rankPosition}º` : "—"}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Posição</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-green-400">
              {prize > 0 ? `R$${prize.toFixed(0)}` : "—"}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Prêmio total</p>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/boloes/${bolaoId}/palpites`}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl py-3 text-sm transition-colors"
          >
            ⚽ Meus palpites
          </Link>
          <Link
            href={`/boloes/${bolaoId}/ranking`}
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl py-3 text-sm transition-colors"
          >
            📊 Ranking completo
          </Link>
        </div>

        {/* Próximos jogos */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Próximos jogos</h2>
            <div className="space-y-2">
              {upcoming.map((match) => {
                const palpite = palpiteMap.get(match.id)
                const { label, cls } = statusLabel(match.status)
                return (
                  <div key={match.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 text-sm">
                        <span className="font-semibold text-white">{match.homeTeam.shortName}</span>
                        <span className="text-zinc-600 mx-2">×</span>
                        <span className="font-semibold text-white">{match.awayTeam.shortName}</span>
                      </div>
                      <span className={`text-xs ${cls}`}>{formatDate(match.kickoffAt)}</span>
                    </div>
                    {palpite ? (
                      <p className="text-xs text-zinc-500 mt-1">
                        Seu palpite: <span className="text-zinc-300 font-mono">{palpite.homeScore} × {palpite.awayScore}</span>
                      </p>
                    ) : bolao.palpitesOpen ? (
                      <p className="text-xs text-yellow-500 mt-1">Sem palpite ainda</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Resultados recentes */}
        {recent.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Resultados recentes</h2>
            <div className="space-y-2">
              {recent.map((match) => {
                const palpite = palpiteMap.get(match.id)
                const pts = palpite?.points
                return (
                  <div key={match.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 text-sm">
                        <span className="font-semibold text-white">{match.homeTeam.shortName}</span>
                        <span className="text-zinc-400 font-mono mx-2">{match.homeScore} × {match.awayScore}</span>
                        <span className="font-semibold text-white">{match.awayTeam.shortName}</span>
                      </div>
                      {pts != null ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          pts === scoringConfig.exact ? "bg-green-900 text-green-400" :
                          pts === scoringConfig.result ? "bg-blue-900 text-blue-400" :
                          "bg-zinc-800 text-zinc-500"
                        }`}>
                          {pts > 0 ? `+${pts} pts` : "0 pts"}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-600">Sem palpite</span>
                      )}
                    </div>
                    {palpite && (
                      <p className="text-xs text-zinc-600 mt-1">
                        Palpite: <span className="font-mono">{palpite.homeScore} × {palpite.awayScore}</span>
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Top 5 Ranking */}
        {bolao.participations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Top ranking</h2>
              <Link href={`/boloes/${bolaoId}/ranking`} className="text-xs text-green-400 hover:underline">Ver tudo →</Link>
            </div>
            <div className="space-y-1.5">
              {bolao.participations.map((p, i) => {
                const pos = i + 1
                const isMe = p.userId === session.user.id
                const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : null
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${isMe ? "bg-green-950 border border-green-800" : "bg-zinc-900 border border-zinc-800"}`}
                  >
                    <span className="w-5 text-center text-sm">{medal ?? <span className="text-zinc-600 font-bold text-xs">{pos}º</span>}</span>
                    <span className={`flex-1 text-sm font-semibold ${isMe ? "text-green-300" : "text-white"}`}>
                      {p.user.nickname}
                      {isMe && <span className="ml-1.5 text-xs font-normal text-green-500">(você)</span>}
                    </span>
                    <span className="font-black text-white">{p.totalPoints}</span>
                    <span className="text-xs text-zinc-600">pts</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Info do bolão */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm space-y-2 text-zinc-400">
          <div className="flex justify-between">
            <span>Participantes pagos</span>
            <span className="text-white font-semibold">{bolao._count.participations}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxa de entrada</span>
            <span className="text-white font-semibold">R$ {Number(bolao.entryFee).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pontuação: placar exato</span>
            <span className="text-white font-semibold">+{scoringConfig.exact} pts</span>
          </div>
          <div className="flex justify-between">
            <span>Pontuação: resultado certo</span>
            <span className="text-white font-semibold">+{scoringConfig.result} pts</span>
          </div>
        </section>

      </div>
    </div>
  )
}
