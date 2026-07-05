"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

type Team = { id: string; name: string; shortName: string }
type Season = { id: string; year: number; competition: { name: string } }

function NovoMatchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSeasonId = searchParams.get("seasonId") ?? ""

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [teams, setTeams] = useState<Team[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [form, setForm] = useState({
    seasonId: preSeasonId,
    homeTeamId: "",
    awayTeamId: "",
    stage: "Fase de Grupos",
    round: "",
    kickoffAt: "",
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/teams").then((r) => r.json()),
      fetch("/api/admin/seasons").then((r) => r.json()),
    ]).then(([t, s]) => { setTeams(t); setSeasons(s) })
  }, [])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.homeTeamId === form.awayTeamId) {
      setError("Os dois times não podem ser iguais.")
      return
    }
    setError("")
    setLoading(true)

    const res = await fetch("/api/admin/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, round: form.round ? parseInt(form.round) : null }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar jogo.")
      return
    }

    const season = seasons.find((s) => s.id === form.seasonId)
    if (season) {
      router.push(`/admin/seasons/${form.seasonId}`)
    } else {
      router.push("/admin/matches")
    }
    router.refresh()
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Novo Jogo</h1>
        <p className="text-zinc-400 text-sm mt-1">Adicione um jogo a uma temporada</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Temporada</label>
          <select required value={form.seasonId} onChange={(e) => set("seasonId", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Selecione...</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.competition.name} {s.year}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Time da casa</label>
            <select required value={form.homeTeamId} onChange={(e) => set("homeTeamId", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Selecione...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Time visitante</label>
            <select required value={form.awayTeamId} onChange={(e) => set("awayTeamId", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Selecione...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Fase / Etapa</label>
            <input type="text" required placeholder="Ex: Fase de Grupos" value={form.stage}
              onChange={(e) => set("stage", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Rodada (opcional)</label>
            <input type="number" min="1" placeholder="Ex: 1" value={form.round}
              onChange={(e) => set("round", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Data e hora (horário de Brasília)</label>
          <input type="datetime-local" required value={form.kickoffAt}
            onChange={(e) => set("kickoffAt", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500">
            {loading ? "Salvando..." : "Criar jogo"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}

export default function NovoMatchPage() {
  return <Suspense><NovoMatchForm /></Suspense>
}
