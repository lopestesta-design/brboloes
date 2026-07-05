"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const formats = [
  { value: "LIGA", label: "Liga (pontos corridos)" },
  { value: "GRUPOS_MATA", label: "Grupos + Mata-mata (ex: Copa do Mundo)" },
  { value: "COPA_MATA", label: "Copa / Mata-mata direto" },
  { value: "LIGA_MATA", label: "Liga + Mata-mata (ex: Libertadores)" },
]

export default function NovaCompetitionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    country: "Brasil",
    logoUrl: "",
    formatType: "LIGA",
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/admin/competitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar competição.")
      return
    }

    router.push("/admin/competitions")
    router.refresh()
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nova Competição</h1>
        <p className="text-zinc-400 text-sm mt-1">Cadastre uma competição no catálogo global</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Nome completo</label>
          <input
            type="text"
            required
            placeholder="Ex: Brasileirão Série A"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Abreviação</label>
            <input
              type="text"
              required
              placeholder="Ex: BRAS-A"
              value={form.shortName}
              onChange={(e) => set("shortName", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">País</label>
            <input
              type="text"
              required
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Formato</label>
          <select
            value={form.formatType}
            onChange={(e) => set("formatType", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {formats.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">URL do logo (opcional)</label>
          <input
            type="url"
            placeholder="https://..."
            value={form.logoUrl}
            onChange={(e) => set("logoUrl", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500">
            {loading ? "Salvando..." : "Criar competição"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
