"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Match = {
  id: string
  homeTeam: { name: string; shortName: string }
  awayTeam: { name: string; shortName: string }
  homeScore: number | null
  awayScore: number | null
  status: string
  kickoffAt: Date
  stage: string
  round: number | null
}

export function MatchResultRow({ match, bolaoId }: {
  match: Match
  bolaoId: string
}) {
  const router = useRouter()
  const [home, setHome] = useState(match.homeScore?.toString() ?? "")
  const [away, setAway] = useState(match.awayScore?.toString() ?? "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const kickoff = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(match.kickoffAt))

  async function handleSave() {
    if (home === "" || away === "") return
    setLoading(true)
    setError("")

    const res = await fetch(`/api/tenant/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeScore: Number(home),
        awayScore: Number(away),
        bolaoId,
      }),
    })

    setLoading(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => { setSaved(false); router.refresh() }, 1500)
    } else {
      const data = await res.json()
      setError(data.error ?? "Erro ao salvar.")
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <span className="text-xs text-zinc-500">{kickoff}</span>
          {match.round && <span className="text-xs text-zinc-600 ml-2">· Rodada {match.round}</span>}
        </div>
        <span className="text-xs text-zinc-600">{match.stage}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex-1 text-right font-bold text-white text-sm">{match.homeTeam.name}</span>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="99"
            value={home}
            onChange={(e) => setHome(e.target.value)}
            className="w-12 text-center text-lg font-black bg-zinc-800 border border-zinc-700 rounded-lg py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-zinc-600 font-bold">×</span>
          <input
            type="number"
            min="0"
            max="99"
            value={away}
            onChange={(e) => setAway(e.target.value)}
            className="w-12 text-center text-lg font-black bg-zinc-800 border border-zinc-700 rounded-lg py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <span className="flex-1 font-bold text-white text-sm">{match.awayTeam.name}</span>

        <button
          onClick={handleSave}
          disabled={loading || home === "" || away === ""}
          className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-40 ${
            saved
              ? "bg-green-700 text-green-300"
              : "bg-green-600 hover:bg-green-500 text-white"
          }`}
        >
          {loading ? "..." : saved ? "✓ Salvo!" : "Salvar"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
