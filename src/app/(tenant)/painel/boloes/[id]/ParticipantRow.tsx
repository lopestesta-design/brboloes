"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  participation: {
    id: string
    paid: boolean
    totalPoints: number
    rankPosition: number | null
    invoiceUrl: string | null
    user: { id: string; name: string; nickname: string; email: string; whatsapp: string | null }
  }
  pos: number
  entryFee: number
  pixKey: string | null
}

export function ParticipantRow({ participation: p, pos, entryFee }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function confirmPayment() {
    if (!confirm(`Confirmar pagamento de ${p.user.name}?`)) return
    setLoading(true)
    const res = await fetch(`/api/tenant/participations/${p.id}/confirm`, {
      method: "PATCH",
    })
    setLoading(false)
    if (res.ok) router.refresh()
  }

  return (
    <div className={`flex items-center gap-4 rounded-xl px-4 py-3 border transition-colors ${
      p.paid ? "bg-zinc-900 border-zinc-800" : "bg-zinc-950 border-yellow-900"
    }`}>
      {/* Posição */}
      <div className="w-8 text-center shrink-0">
        {p.paid ? (
          <span className="text-zinc-500 font-bold text-sm">{pos > 0 ? `${pos}º` : "—"}</span>
        ) : (
          <span className="text-yellow-600 text-xs font-bold">⏳</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm truncate">{p.user.nickname}</p>
        <p className="text-xs text-zinc-500 truncate">{p.user.name} · {p.user.email}</p>
        {p.user.whatsapp && (
          <p className="text-xs text-zinc-600">{p.user.whatsapp}</p>
        )}
      </div>

      {/* Pontos */}
      {p.paid && (
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-white">{p.totalPoints}</p>
          <p className="text-xs text-zinc-500">pts</p>
        </div>
      )}

      {/* Status / Ação */}
      <div className="shrink-0">
        {p.paid ? (
          <span className="text-xs bg-green-900 text-green-400 font-bold px-2 py-1 rounded-full">
            Pago
          </span>
        ) : (
          <div className="flex items-center gap-2">
            {p.invoiceUrl && (
              <a
                href={p.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline"
              >
                Ver cobrança
              </a>
            )}
            <button
              onClick={confirmPayment}
              disabled={loading}
              className="text-xs bg-yellow-700 hover:bg-yellow-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Confirmar"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
