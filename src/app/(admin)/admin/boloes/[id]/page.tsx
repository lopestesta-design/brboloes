import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { BolaoActions } from "./BolaoActions"
import { ParticipationList } from "./ParticipationList"

export default async function BolaoAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const bolao = await db.bolao.findUnique({
    where: { id },
    include: {
      tenant: true,
      season: { include: { competition: true } },
      participations: {
        include: { user: { select: { id: true, name: true, nickname: true, email: true } } },
        orderBy: { rankPosition: "asc" },
      },
    },
  })

  if (!bolao) notFound()

  const totalArrecadado = bolao.participations.filter((p) => p.paid).length * Number(bolao.entryFee)
  const premio = totalArrecadado * (Number(bolao.prizePct) / 100)

  const inviteUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3001"}/convite/${bolao.inviteSlug}`

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <Link href="/admin/tenants" className="text-xs text-zinc-500 hover:text-zinc-300">← Tenants</Link>
          <h1 className="text-2xl font-bold text-white mt-1">{bolao.name}</h1>
          <p className="text-zinc-400 text-sm">{bolao.season.competition.name} {bolao.season.year} · {bolao.tenant.name}</p>
        </div>
        <BolaoActions bolaoId={bolao.id} palpitesOpen={bolao.palpitesOpen} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {[
          { label: "Participantes", value: bolao.participations.length },
          { label: "Pagos", value: bolao.participations.filter((p) => p.paid).length },
          { label: "Arrecadado", value: `R$ ${totalArrecadado.toFixed(2)}` },
          { label: "Prêmio estimado", value: `R$ ${premio.toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Link de convite */}
      <div className="bg-zinc-900 border border-green-800 rounded-xl p-5 mb-6">
        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">🔗 Link de convite</p>
        <p className="text-sm text-zinc-300 break-all font-mono">{inviteUrl}</p>
        <p className="text-xs text-zinc-500 mt-2">Compartilhe este link com os participantes</p>
      </div>

      {/* Status dos palpites */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${bolao.palpitesOpen ? "bg-green-900 text-green-400" : "bg-zinc-800 text-zinc-400"}`}>
          {bolao.palpitesOpen ? "🟢 Palpites abertos" : "🔴 Palpites fechados"}
        </span>
        <Link
          href={`/boloes/${bolao.id}/ranking`}
          className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Ver ranking
        </Link>
      </div>

      {/* Lista de participantes */}
      <ParticipationList
        bolaoId={bolao.id}
        entryFee={Number(bolao.entryFee)}
        participations={bolao.participations.map((p) => ({
          id: p.id,
          userId: p.userId,
          userName: p.user.name,
          nickname: p.user.nickname,
          email: p.user.email,
          paid: p.paid,
          paidAt: p.paidAt?.toISOString() ?? null,
          totalPoints: p.totalPoints,
          rankPosition: p.rankPosition,
        }))}
      />
    </div>
  )
}
