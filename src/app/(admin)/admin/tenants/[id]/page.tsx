"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"

type Tenant = {
  id: string
  name: string
  slug: string
  whatsapp: string | null
  pixKey: string | null
  primaryColor: string
  commissionPct: string
  active: boolean
}

export default function EditTenantPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    slug: "",
    whatsapp: "",
    pixKey: "",
    primaryColor: "#16a34a",
    commissionPct: "5",
    active: true,
  })

  useEffect(() => {
    fetch(`/api/admin/tenants/${id}`)
      .then((r) => r.json())
      .then((t: Tenant) => {
        setForm({
          name: t.name,
          slug: t.slug,
          whatsapp: t.whatsapp ?? "",
          pixKey: t.pixKey ?? "",
          primaryColor: t.primaryColor,
          commissionPct: String(t.commissionPct),
          active: t.active,
        })
        setFetching(false)
      })
  }, [id])

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch(`/api/admin/tenants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao salvar.")
      return
    }

    router.push("/admin/tenants")
    router.refresh()
  }

  if (fetching) return <div className="p-8 text-zinc-400">Carregando...</div>

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-xs text-zinc-500 hover:text-zinc-300 mb-2 block">← Voltar</button>
        <h1 className="text-2xl font-bold text-white">Editar Tenant</h1>
        <p className="text-zinc-400 text-sm mt-1">/{form.slug}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Nome</label>
          <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">WhatsApp</label>
          <input type="tel" placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">Chave PIX</label>
          <input type="text" placeholder="CPF, e-mail, telefone..." value={form.pixKey} onChange={(e) => set("pixKey", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Cor principal</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-zinc-700 bg-transparent" />
              <span className="text-zinc-400 text-sm">{form.primaryColor}</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Comissão (%)</label>
            <input type="number" min="0" max="20" step="0.5" value={form.commissionPct} onChange={(e) => set("commissionPct", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="active" checked={form.active} onChange={(e) => set("active", e.target.checked)}
            className="w-4 h-4 accent-green-500" />
          <label htmlFor="active" className="text-sm text-zinc-300">Tenant ativo</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500">
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
