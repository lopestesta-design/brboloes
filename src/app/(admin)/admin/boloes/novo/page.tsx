"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Tenant = { id: string; name: string; slug: string }
type Season = { id: string; year: number; competition: { name: string } }

export default function NovoBolaoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [form, setForm] = useState({
    tenantId: "",
    seasonId: "",
    name: "",
    entryFee: "0",
    prizePct: "70",
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/tenants").then((r) => r.json()),
      fetch("/api/admin/seasons").then((r) => r.json()),
    ]).then(([t, s]) => { setTenants(t); setSeasons(s) })
  }, [])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/admin/boloes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar bolão.")
      return
    }

    const bolao = await res.json()
    router.push(`/admin/boloes/${bolao.id}`)
    router.refresh()
  }

  const premioPct = parseInt(form.prizePct) || 0
  const plataformaPct = 5
  const organizadorPct = 100 - premioPct - plataformaPct

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Novo Bolão</h1>
        <p className="text-zinc-400 text-sm mt-1">Crie um bolão vinculando um tenant a uma temporada</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Tenant (organizador)</label>
          <select required value={form.tenantId} onChange={(e) => set("tenantId", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Selecione...</option>
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Temporada</label>
          <select required value={form.seasonId} onChange={(e) => set("seasonId", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Selecione...</option>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.competition.name} {s.year}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Nome do bolão</label>
          <input type="text" required placeholder="Ex: Bolão do Escritório 2026"
            value={form.name} onChange={(e) => set("name", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Taxa de inscrição (R$)</label>
            <input type="number" min="0" step="0.01" value={form.entryFee}
              onChange={(e) => set("entryFee", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">% para o prêmio</label>
            <input type="number" min="50" max="95" value={form.prizePct}
              onChange={(e) => set("prizePct", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        {parseFloat(form.entryFee) > 0 && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-sm space-y-1">
            <p className="text-zinc-400 font-medium mb-2">Distribuição por participante (R$ {parseFloat(form.entryFee).toFixed(2)}):</p>
            <div className="flex justify-between"><span className="text-zinc-400">🏆 Prêmio</span><span className="text-green-400 font-bold">{premioPct}%</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">👤 Organizador</span><span className="text-zinc-300 font-bold">{organizadorPct > 0 ? organizadorPct : 0}%</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">⚡ Plataforma</span><span className="text-zinc-500">{plataformaPct}%</span></div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500">
            {loading ? "Criando..." : "Criar bolão"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
