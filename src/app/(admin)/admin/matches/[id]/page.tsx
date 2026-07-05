import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MatchResultForm } from "./MatchResultForm"

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const match = await db.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true, season: { include: { competition: true } } },
  })

  if (!match) notFound()

  return (
    <div className="p-8 max-w-lg">
      <Link href={`/admin/seasons/${match.seasonId}`} className="text-xs text-zinc-500 hover:text-zinc-300">
        ← {match.season.competition.name} {match.season.year}
      </Link>

      <h1 className="text-2xl font-bold text-white mt-2 mb-1">
        {match.homeTeam.name} × {match.awayTeam.name}
      </h1>
      <p className="text-zinc-400 text-sm mb-8">
        {match.stage} · {new Date(match.kickoffAt).toLocaleString("pt-BR", {
          day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
        })}
      </p>

      <MatchResultForm match={{
        id: match.id,
        homeTeamName: match.homeTeam.name,
        awayTeamName: match.awayTeam.name,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status,
      }} />
    </div>
  )
}
