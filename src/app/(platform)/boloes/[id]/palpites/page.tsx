import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { PalpitesForm } from "./PalpitesForm"

export default async function PalpitesPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ rodada?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id: bolaoId } = await params
  const { rodada } = await searchParams

  const bolao = await db.bolao.findUnique({
    where: { id: bolaoId },
    include: { season: { include: { competition: true } }, tenant: true },
  })
  if (!bolao) notFound()

  const participation = await db.participation.findUnique({
    where: { bolaoId_userId: { bolaoId, userId: session.user.id } },
  })

  if (!participation) redirect(`/convite/${bolao.inviteSlug}`)
  if (!participation.paid && Number(bolao.entryFee) > 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">⏳</p>
          <h1 className="text-xl font-bold text-white mb-2">Aguardando confirmação</h1>
          <p className="text-zinc-400 text-sm">O organizador ainda não confirmou seu pagamento. Assim que confirmar, você poderá palpitar.</p>
          <Link href="/dashboard" className="text-green-400 hover:underline text-sm mt-4 inline-block">← Voltar</Link>
        </div>
      </div>
    )
  }

  // Busca jogos da temporada
  const agora = new Date()
  const matches = await db.match.findMany({
    where: { seasonId: bolao.seasonId, status: { not: "CANCELLED" } },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoffAt: "asc" },
  })

  // Rodadas disponíveis
  const rodadas = [...new Set(matches.map((m) => m.round).filter(Boolean))] as number[]
  const rodadaSel = rodada ? parseInt(rodada) : (rodadas[0] ?? null)

  const matchesDaRodada = rodadaSel
    ? matches.filter((m) => m.round === rodadaSel)
    : matches.slice(0, 10)

  // Palpites do usuário
  const palpites = await db.palpite.findMany({
    where: { participationId: participation.id },
  })
  const palpiteMap = Object.fromEntries(palpites.map((p) => [p.matchId, p]))

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-black text-white">{bolao.name}</h1>
            <p className="text-xs text-zinc-500">{bolao.season.competition.name} {bolao.season.year}</p>
          </div>
          <Link href={`/boloes/${bolaoId}/ranking`} className="text-sm text-green-400 hover:underline">📊 Ranking</Link>
        </div>
      </header>

      {/* Navegação de rodadas */}
      {rodadas.length > 0 && (
        <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          {rodadas.map((r) => (
            <Link
              key={r}
              href={`/boloes/${bolaoId}/palpites?rodada=${r}`}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                r === rodadaSel ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              R{r}
            </Link>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!bolao.palpitesOpen && (
          <div className="bg-yellow-950 border border-yellow-800 text-yellow-400 text-sm px-4 py-3 rounded-lg mb-4 text-center">
            🔒 Palpites fechados pelo organizador
          </div>
        )}

        <PalpitesForm
          participationId={participation.id}
          bolaoId={bolaoId}
          palpitesOpen={bolao.palpitesOpen}
          matches={matchesDaRodada.map((m) => ({
            id: m.id,
            homeTeam: m.homeTeam.name,
            awayTeam: m.awayTeam.name,
            homeTeamLogo: m.homeTeam.logoUrl,
            awayTeamLogo: m.awayTeam.logoUrl,
            kickoffAt: m.kickoffAt.toISOString(),
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            status: m.status,
            palpite: palpiteMap[m.id]
              ? { homeScore: palpiteMap[m.id].homeScore, awayScore: palpiteMap[m.id].awayScore, points: palpiteMap[m.id].points }
              : null,
          }))}
        />
      </div>
    </div>
  )
}
