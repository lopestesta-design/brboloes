import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { JoinButton } from "./JoinButton"

export default async function ConvitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()

  const bolao = await db.bolao.findUnique({
    where: { inviteSlug: slug },
    include: {
      tenant: true,
      season: { include: { competition: true } },
      _count: { select: { participations: { where: { paid: true } } } },
    },
  })

  if (!bolao || !bolao.active) notFound()

  // Verifica se usuário já participa
  let alreadyJoined = false
  let participationId: string | null = null
  if (session?.user?.id) {
    const existing = await db.participation.findUnique({
      where: { bolaoId_userId: { bolaoId: bolao.id, userId: session.user.id } },
    })
    alreadyJoined = !!existing
    participationId = existing?.id ?? null
  }

  const gratuito = Number(bolao.entryFee) === 0

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Header do bolão */}
        <div
          className="rounded-2xl p-6 text-center mb-6"
          style={{ background: `linear-gradient(135deg, ${bolao.tenant.primaryColor}33, ${bolao.tenant.primaryColor}11)`, border: `1px solid ${bolao.tenant.primaryColor}44` }}
        >
          <div className="text-4xl mb-3">⚽</div>
          <h1 className="text-2xl font-black text-white">{bolao.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">{bolao.season.competition.name} {bolao.season.year}</p>
          <p className="text-zinc-500 text-xs mt-1">por {bolao.tenant.name}</p>
        </div>

        {/* Infos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Participantes (pagos)</span>
            <span className="text-white font-bold">{bolao._count.participations}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Inscrição</span>
            <span className="text-white font-bold">
              {gratuito ? "Gratuito 🎁" : `R$ ${Number(bolao.entryFee).toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">% para prêmio</span>
            <span className="text-white font-bold">{Number(bolao.prizePct).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Palpites</span>
            <span className={`font-bold ${bolao.palpitesOpen ? "text-green-400" : "text-red-400"}`}>
              {bolao.palpitesOpen ? "Abertos" : "Fechados"}
            </span>
          </div>
        </div>

        {/* CTA */}
        {alreadyJoined ? (
          <div className="space-y-3">
            <div className="text-center text-sm text-green-400 font-bold py-2">✅ Você já participa deste bolão!</div>
            <a
              href={`/boloes/${bolao.id}/palpites`}
              className="block text-center bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ir para palpites →
            </a>
          </div>
        ) : session?.user ? (
          <JoinButton bolaoId={bolao.id} gratuito={gratuito} entryFee={Number(bolao.entryFee)} pixKey={bolao.tenant.pixKey} />
        ) : (
          <div className="space-y-3">
            <p className="text-center text-sm text-zinc-400">Para participar, faça login ou crie sua conta.</p>
            <a
              href={`/login?callbackUrl=/convite/${slug}`}
              className="block text-center bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Entrar / Criar conta
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
