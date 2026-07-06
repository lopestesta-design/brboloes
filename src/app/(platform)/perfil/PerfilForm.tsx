"use client"

import { useState } from "react"

export function PerfilForm({ name: initialName, nickname: initialNickname, whatsapp: initialWhatsapp }: {
  name: string
  nickname: string
  whatsapp: string
}) {
  const [name, setName] = useState(initialName)
  const [nickname, setNickname] = useState(initialNickname)
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)

    const res = await fetch("/api/user/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, nickname, whatsapp }),
    })

    setSaving(false)
    if (res.ok) {
      setSaved(true)
    } else {
      const d = await res.json()
      setError(d.error ?? "Erro ao salvar.")
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome completo</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Apelido <span className="text-zinc-600 normal-case font-normal">(aparece no ranking)</span></label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
          WhatsApp <span className="text-zinc-600 normal-case font-normal">(para receber notificações)</span>
        </label>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="11999999999"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <p className="text-xs text-zinc-600 mt-1">Somente números com DDD. Ex: 12991236887</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black py-4 rounded-xl text-lg transition-colors"
      >
        {saving ? "Salvando..." : saved ? "✅ Salvo!" : "Salvar perfil"}
      </button>
    </form>
  )
}
