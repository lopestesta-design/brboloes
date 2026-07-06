"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type PixData = {
  pixQrCode: string   // base64 PNG
  pixCode: string     // copia e cola
  invoiceUrl: string
}

export function JoinButton({
  bolaoId,
  gratuito,
  entryFee,
}: {
  bolaoId: string
  gratuito: boolean
  entryFee: number
  pixKey: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pix, setPix] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  async function handleJoin() {
    setLoading(true)
    setError("")
    const res = await fetch(`/api/boloes/${bolaoId}/join`, { method: "POST" })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? "Erro ao entrar no bolão.")
      return
    }

    if (gratuito) {
      router.push(`/boloes/${bolaoId}/palpites`)
      return
    }

    if (data.pixCode) {
      setPix({ pixQrCode: data.pixQrCode, pixCode: data.pixCode, invoiceUrl: data.invoiceUrl })
    } else {
      // Asaas falhou — mostra fallback
      setPix({ pixQrCode: "", pixCode: "", invoiceUrl: data.invoiceUrl ?? "" })
    }
  }

  async function copyCode() {
    if (!pix?.pixCode) return
    await navigator.clipboard.writeText(pix.pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (pix) {
    return (
      <div className="bg-zinc-900 border border-yellow-800 rounded-2xl p-5 space-y-4">
        <div className="text-center">
          <p className="text-yellow-400 font-bold text-base">Inscrição realizada!</p>
          <p className="text-zinc-400 text-sm mt-1">
            Pague <strong className="text-white">R$ {entryFee.toFixed(2)}</strong> via PIX para confirmar sua vaga.
          </p>
        </div>

        {pix.pixQrCode ? (
          <div className="flex justify-center">
            <img
              src={`data:image/png;base64,${pix.pixQrCode}`}
              alt="QR Code PIX"
              className="w-44 h-44 rounded-xl border border-zinc-700"
            />
          </div>
        ) : null}

        {pix.pixCode ? (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 text-center">Ou copie o código PIX:</p>
            <div className="flex gap-2">
              <p className="flex-1 font-mono text-xs text-zinc-300 bg-zinc-800 px-3 py-2 rounded-lg break-all leading-relaxed">
                {pix.pixCode}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
            >
              {copied ? "✅ Copiado!" : "Copiar código PIX"}
            </button>
          </div>
        ) : pix.invoiceUrl ? (
          <a
            href={pix.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition-colors"
          >
            Pagar via Asaas →
          </a>
        ) : null}

        <p className="text-xs text-zinc-600 text-center">
          Sua vaga será confirmada automaticamente após o pagamento.
        </p>

        <a
          href={`/boloes/${bolaoId}/ranking`}
          className="block text-center text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          Ver ranking enquanto aguarda →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors text-lg"
      >
        {loading
          ? "Entrando..."
          : gratuito
          ? "Participar gratuitamente"
          : `Participar · R$ ${entryFee.toFixed(2)}`}
      </button>
      {!gratuito && (
        <p className="text-xs text-zinc-500 text-center">
          Você receberá o QR code PIX após confirmar.
        </p>
      )}
    </div>
  )
}
