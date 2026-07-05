"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function SeasonActions({ seasonId, status }: { seasonId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function changeStatus(newStatus: string) {
    setLoading(true)
    await fetch(`/api/admin/seasons/${seasonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      {status === "DRAFT" && (
        <Button size="sm" onClick={() => changeStatus("ACTIVE")} disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-xs">
          Ativar temporada
        </Button>
      )}
      {status === "ACTIVE" && (
        <Button size="sm" onClick={() => changeStatus("FINISHED")} disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-xs">
          Finalizar temporada
        </Button>
      )}
    </div>
  )
}
