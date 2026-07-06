import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { MatchResultRow } from "./MatchResultRow"

export default async function TenantJogosPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await db.tenantMember.findFirst({
    where: { userId: session.user.id, role: "ADMIN" },
  })
  if (!membership) redirect("/dashboard")

  const { id: bolaoId } = await params

  const bolao = await db.bolao.findFirst({
    where: { id: bolaoId, tenantId: membership.tenantId },
    include: {
      season: {
        include: {
          competition: true,
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: { kickoffAt: "asc" },
          },
        },
      },
    },
  })

  if (!bolao) notFound()

  const matches = bolao.season.matches
  const finished = matches.filter((m) => m.status === "FINISHED")
  const upcoming = matches.filter((m) => m.status !== "FINISHED")

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href={`/painel/boloes/${bolaoId}`} className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
          ← {bolao.name}
        </Link>
        <h1 className="text-2xl font-black text-white mt-2">Lançar Resultados</h1>
        <p className="text-zinc-400 text-sm">{bolao.season.competition.name} {bolao.season.year}</p>
      </div>

      {/* Jogos pendentes */}
      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
            Aguardando resultado ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map((match) => (
              <MatchResultRow key={match.id} match={match} bolaoId={bolaoId} scoringConfig={bolao.scoringConfig as { exact: number; result: number; wrong: number }} />
            ))}
          </div>
        </section>
      )}

      {/* Jogos encerrados */}
      {finished.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
            Encerrados ({finished.length})
          </h2>
          <div className="space-y-2">
            {finished.reverse().map((match) => (
              <div key={match.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3">
                <div className="flex-1 text-sm font-semibold text-zinc-400">
                  {match.homeTeam.shortName}
                  <span className="text-white font-black mx-3">{match.homeScore} × {match.awayScore}</span>
                  {match.awayTeam.shortName}
                </div>
                <span className="text-xs text-zinc-600">
                  {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(match.kickoffAt))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <div className="text-center py-16 text-zinc-600">
          <p>Nenhum jogo cadastrado nesta temporada.</p>
        </div>
      )}
    </div>
  )
}
