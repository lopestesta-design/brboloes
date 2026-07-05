"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function JoinButton({
  bolaoId,
  gratuito,
  entryFee,
  pixKey,
}: {
  bolaoId: string
  gratuito: boolean
  entryFee: number
  pixKey: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)

  async function handleJoin() {
    setLoading(true)
    const res = await fetch(`/api/boloes/${bolaoId}/join`, { method: "POST" })
    setLoading(false)

    if (res.ok) {
      setJoined(true)
      if (gratuito) {
        router.push(`/boloes/${bolaoId}/palpites`)
      }
    }
  }

  if (joined && !gratuito) {
    return (
      <div className="bg-zinc-900 border border-yellow-700 rounded-xl p-5 text-center space-y-3">
        <p className="text-yellow-400 font-bold">✅ Inscrição realizada!</p>
        <p className="text-sm text-zinc-400">
          Faça o PIX de <strong className="text-white">R$ {entryFee.toFixed(2)}</strong> para a chave:
        </p>
        <p className="font-mono text-sm text-white bg-zinc-800 px-3 py-2 rounded-lg break-all">
          {pixKey ?? "Aguarde — o organizador enviará os dados de pagamento."}
        </p>
        <p className="text-xs text-zinc-500">O organizador confirmará seu pagamento em breve.</p>
        <a
          href={`/boloes/${bolaoId}/palpites`}
          className="block text-center bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors mt-2"
        >
          Ver palpites (liberado após confirmação)
        </a>
      </div>
    )
  }

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-lg"
    >
      {loading ? "Entrando..." : gratuito ? "Participar gratuitamente" : `Participar · R$ ${entryFee.toFixed(2)}`}
    </button>
  )
}
