"use client"

import { useState } from "react"

type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  homeTeamLogo: string | null
  awayTeamLogo: string | null
  kickoffAt: string
  homeScore: number | null
  awayScore: number | null
  status: string
  palpite: { homeScore: number; awayScore: number; points: number | null } | null
}

export function PalpitesForm({
  participationId,
  bolaoId,
  palpitesOpen,
  matches,
}: {
  participationId: string
  bolaoId: string
  palpitesOpen: boolean
  matches: Match[]
}) {
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>(() =>
    Object.fromEntries(
      matches.map((m) => [
        m.id,
        { home: m.palpite?.homeScore?.toString() ?? "", away: m.palpite?.awayScore?.toString() ?? "" },
      ])
    )
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const agora = new Date()

  function isLocked(m: Match) {
    return !palpitesOpen || m.status !== "SCHEDULED" || new Date(m.kickoffAt) <= agora
  }

  function setScore(matchId: string, side: "home" | "away", val: string) {
    if (val !== "" && (isNaN(parseInt(val)) || parseInt(val) < 0)) return
    setScores((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [side]: val } }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const payload = matches
      .filter((m) => !isLocked(m) && scores[m.id]?.home !== "" && scores[m.id]?.away !== "")
      .map((m) => ({ matchId: m.id, homeScore: parseInt(scores[m.id].home), awayScore: parseInt(scores[m.id].away) }))

    await fetch(`/api/boloes/${bolaoId}/palpites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participationId, palpites: payload }),
    })
    setSaving(false)
    setSaved(true)
  }

  const hasPending = matches.some((m) => !isLocked(m))

  return (
    <div className="space-y-3">
      {matches.map((m) => {
        const locked = isLocked(m)
        const kickoff = new Date(m.kickoffAt)
        const s = scores[m.id] ?? { home: "", away: "" }

        return (
          <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 text-center mb-3">
              📅 {kickoff.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              {m.status === "FINISHED" && m.homeScore !== null && (
                <span className="ml-2 text-green-400 font-bold">· Resultado: {m.homeScore}×{m.awayScore}</span>
              )}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                {m.homeTeamLogo && <img src={m.homeTeamLogo} alt="" className="w-8 h-8 object-contain mx-auto mb-1" />}
                <p className="text-sm font-bold text-white leading-tight">{m.homeTeam}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number" min="0" max="30"
                  disabled={locked}
                  value={s.home}
                  onChange={(e) => setScore(m.id, "home", e.target.value)}
                  className="w-14 h-14 text-2xl font-black text-center bg-zinc-800 border border-zinc-700 rounded-xl text-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-zinc-600 font-black">×</span>
                <input
                  type="number" min="0" max="30"
                  disabled={locked}
                  value={s.away}
                  onChange={(e) => setScore(m.id, "away", e.target.value)}
                  className="w-14 h-14 text-2xl font-black text-center bg-zinc-800 border border-zinc-700 rounded-xl text-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="flex-1 text-center">
                {m.awayTeamLogo && <img src={m.awayTeamLogo} alt="" className="w-8 h-8 object-contain mx-auto mb-1" />}
                <p className="text-sm font-bold text-white leading-tight">{m.awayTeam}</p>
              </div>
            </div>

            {m.palpite?.points !== null && m.palpite?.points !== undefined && (
              <div className={`text-center text-xs font-bold mt-3 px-3 py-1 rounded-full inline-block w-full ${
                m.palpite.points >= 5 ? "bg-green-900 text-green-400" :
                m.palpite.points === 3 ? "bg-blue-900 text-blue-400" :
                "bg-zinc-800 text-zinc-500"
              }`}>
                {m.palpite.points >= 5 ? "🎯" : m.palpite.points === 3 ? "✅" : "❌"} {m.palpite.points} pts
              </div>
            )}

            {locked && m.status === "SCHEDULED" && (
              <p className="text-xs text-zinc-600 text-center mt-2">🔒 Palpite encerrado</p>
            )}
          </div>
        )
      })}

      {hasPending && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black py-4 rounded-xl text-lg transition-colors mt-4"
        >
          {saving ? "Salvando..." : saved ? "✅ Salvo!" : "💾 Salvar palpites"}
        </button>
      )}
    </div>
  )
}
