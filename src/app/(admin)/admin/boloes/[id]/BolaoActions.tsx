"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function BolaoActions({ bolaoId, palpitesOpen }: { bolaoId: string; palpitesOpen: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/admin/boloes/${bolaoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ palpitesOpen: !palpitesOpen }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      className={palpitesOpen ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"}
    >
      {loading ? "..." : palpitesOpen ? "Fechar palpites" : "Abrir palpites"}
    </Button>
  )
}
