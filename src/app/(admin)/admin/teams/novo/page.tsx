"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function NovoTimePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", shortName: "", country: "Brasil", logoUrl: "" })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar time.")
      return
    }

    router.push("/admin/teams")
    router.refresh()
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Novo Time</h1>
        <p className="text-zinc-400 text-sm mt-1">Cadastre um time no catálogo global</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Nome completo</label>
          <input type="text" required placeholder="Ex: Flamengo" value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Abreviação (3 letras)</label>
            <input type="text" required maxLength={5} placeholder="FLA" value={form.shortName}
              onChange={(e) => set("shortName", e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">País</label>
            <input type="text" required value={form.country}
              onChange={(e) => set("country", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">URL do escudo (opcional)</label>
          <input type="url" placeholder="https://..." value={form.logoUrl}
            onChange={(e) => set("logoUrl", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500">
            {loading ? "Salvando..." : "Criar time"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
