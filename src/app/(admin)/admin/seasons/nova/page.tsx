"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Competition = { id: string; name: string; shortName: string }

export default function NovaSeasonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [form, setForm] = useState({
    competitionId: "",
    year: new Date().getFullYear().toString(),
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetch("/api/admin/competitions").then((r) => r.json()).then(setCompetitions)
  }, [])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/admin/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar temporada.")
      return
    }

    const season = await res.json()
    router.push(`/admin/seasons/${season.id}`)
    router.refresh()
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nova Temporada</h1>
        <p className="text-zinc-400 text-sm mt-1">Associe uma edição a uma competição</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Competição</label>
          <select
            required
            value={form.competitionId}
            onChange={(e) => set("competitionId", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Selecione...</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Ano</label>
          <input
            type="number"
            required
            min="2020"
            max="2040"
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Data de início</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Data de término</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-400">
          💡 A temporada começa como <strong className="text-zinc-300">Rascunho</strong>. Você poderá adicionar jogos e ativar depois.
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500">
            {loading ? "Salvando..." : "Criar temporada"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
