"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function TogglePalpites({ bolaoId, isOpen }: { bolaoId: string; isOpen: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(isOpen)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const res = await fetch(`/api/tenant/boloes/${bolaoId}/palpites-open`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ palpitesOpen: !open }),
    })
    setLoading(false)
    if (res.ok) {
      setOpen(!open)
      router.refresh()
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg font-bold text-sm transition-colors ${
        open
          ? "bg-green-900 text-green-400 hover:bg-green-800"
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
      } disabled:opacity-50`}
    >
      <span>{open ? "Palpites abertos" : "Palpites fechados"}</span>
      <span className={`w-2 h-2 rounded-full ${open ? "bg-green-400" : "bg-zinc-600"}`} />
    </button>
  )
}
