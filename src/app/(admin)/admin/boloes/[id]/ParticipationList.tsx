"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Participation = {
  id: string
  userId: string
  userName: string
  nickname: string
  email: string
  paid: boolean
  paidAt: string | null
  totalPoints: number
  rankPosition: number | null
}

export function ParticipationList({
  bolaoId,
  entryFee,
  participations,
}: {
  bolaoId: string
  entryFee: number
  participations: Participation[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function confirmPayment(participationId: string) {
    setLoading(participationId)
    await fetch(`/api/admin/boloes/${bolaoId}/participations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participationId, paid: true }),
    })
    setLoading(null)
    router.refresh()
  }

  if (participations.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
        <p>Nenhum participante ainda.</p>
        <p className="text-sm mt-1">Compartilhe o link de convite acima.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Participantes ({participations.length})</h2>
      <div className="space-y-2">
        {participations.map((p) => (
          <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                {p.rankPosition ?? "—"}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{p.nickname} <span className="text-zinc-500 font-normal">· {p.userName}</span></p>
                <p className="text-xs text-zinc-500">{p.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-green-400">{p.totalPoints} pts</span>
              {entryFee > 0 && (
                p.paid ? (
                  <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded-full font-bold">Pago</span>
                ) : (
                  <button
                    onClick={() => confirmPayment(p.id)}
                    disabled={loading === p.id}
                    className="text-xs bg-yellow-900 text-yellow-400 hover:bg-yellow-800 px-3 py-1 rounded-full font-bold transition-colors disabled:opacity-50"
                  >
                    {loading === p.id ? "..." : "Confirmar pag."}
                  </button>
                )
              )}
              {entryFee === 0 && (
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">Gratuito</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
