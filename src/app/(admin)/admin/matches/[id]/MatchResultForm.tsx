"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Props = {
  match: {
    id: string
    homeTeamName: string
    awayTeamName: string
    homeScore: number | null
    awayScore: number | null
    status: string
  }
}

export function MatchResultForm({ match }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() ?? "")
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() ?? "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const res = await fetch(`/api/admin/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        status: "FINISHED",
      }),
    })

    setLoading(false)
    if (res.ok) {
      setSuccess(true)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Placar atual */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Placar atual</p>
        {match.homeScore !== null && match.awayScore !== null ? (
          <p className="text-5xl font-black text-green-400">
            {match.homeScore} × {match.awayScore}
          </p>
        ) : (
          <p className="text-zinc-600 text-sm">Sem resultado ainda</p>
        )}
        <p className="text-xs mt-3">
          <span className={`px-2 py-1 rounded-full font-bold ${
            match.status === "FINISHED" ? "bg-blue-900 text-blue-400" :
            match.status === "LIVE" ? "bg-red-900 text-red-400" :
            "bg-zinc-800 text-zinc-400"
          }`}>
            {match.status === "FINISHED" ? "Encerrado" : match.status === "LIVE" ? "Ao vivo" : "Agendado"}
          </span>
        </p>
      </div>

      {/* Formulário de resultado */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <p className="text-sm font-bold text-white mb-5">Inserir / atualizar resultado</p>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 text-center">
            <p className="text-xs text-zinc-500 mb-2">{match.homeTeamName}</p>
            <input
              type="number"
              min="0"
              max="30"
              required
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className="w-20 h-16 text-3xl font-black text-center bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <span className="text-2xl text-zinc-600 font-black">×</span>
          <div className="flex-1 text-center">
            <p className="text-xs text-zinc-500 mb-2">{match.awayTeamName}</p>
            <input
              type="number"
              min="0"
              max="30"
              required
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className="w-20 h-16 text-3xl font-black text-center bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {success && (
          <div className="bg-green-950 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-lg mb-4">
            ✅ Resultado salvo! Os pontos serão calculados automaticamente.
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500">
          {loading ? "Salvando..." : "Salvar resultado"}
        </Button>
      </form>
    </div>
  )
}
