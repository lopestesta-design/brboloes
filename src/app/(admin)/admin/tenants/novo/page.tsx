"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function NovoTenantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    slug: "",
    whatsapp: "",
    pixKey: "",
    primaryColor: "#16a34a",
    commissionPct: "5",
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function slugify(val: string) {
    return val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar tenant.")
      return
    }

    router.push("/admin/tenants")
    router.refresh()
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Novo Tenant</h1>
        <p className="text-zinc-400 text-sm mt-1">Cadastre um novo organizador de bolões</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Nome do bolão / grupo</label>
          <input
            type="text"
            required
            placeholder="Ex: Bolão do Escritório"
            value={form.name}
            onChange={(e) => {
              set("name", e.target.value)
              set("slug", slugify(e.target.value))
            }}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Slug (URL)</label>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-sm">brboloes.com.br/</span>
            <input
              type="text"
              required
              placeholder="bolao-escritorio"
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">WhatsApp do organizador</label>
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Chave PIX</label>
          <input
            type="text"
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            value={form.pixKey}
            onChange={(e) => set("pixKey", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Cor principal</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-zinc-700 bg-transparent"
              />
              <span className="text-zinc-400 text-sm">{form.primaryColor}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Comissão plataforma (%)</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={form.commissionPct}
              onChange={(e) => set("commissionPct", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500">
            {loading ? "Salvando..." : "Criar tenant"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
