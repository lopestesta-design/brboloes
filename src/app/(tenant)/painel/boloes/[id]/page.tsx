import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { TogglePalpites } from "./TogglePalpites"
import { ParticipantRow } from "./ParticipantRow"

export default async function TenantBolaoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await db.tenantMember.findFirst({
    where: { userId: session.user.id, role: "ADMIN" },
  })
  if (!membership) redirect("/dashboard")

  const { id: bolaoId } = await params

  const bolao = await db.bolao.findFirst({
    where: { id: bolaoId, tenantId: membership.tenantId },
    include: {
      season: { include: { competition: true, matches: { include: { homeTeam: true, awayTeam: true }, orderBy: { kickoffAt: "asc" } } } },
      participations: {
        include: { user: { select: { id: true, name: true, nickname: true, email: true, whatsapp: true } } },
        orderBy: [{ paid: "desc" }, { createdAt: "asc" }],
      },
    },
  })

  if (!bolao) notFound()

  const pagos = bolao.participations.filter((p) => p.paid).length
  const pendentes = bolao.participations.filter((p) => !p.paid).length
  const premio = (pagos * Number(bolao.entryFee) * Number(bolao.prizePct)) / 100
  const proximoJogo = bolao.season.matches.find((m) => m.status === "SCHEDULED")

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/painel" className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">← Dashboard</Link>
        <h1 className="text-2xl font-black text-white mt-2">{bolao.name}</h1>
        <p className="text-zinc-400 text-sm">{bolao.season.competition.name} {bolao.season.year}</p>
      </div>

      {/* Stats + controles */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Participantes pagos</span>
            <span className="text-white font-bold">{pagos}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Pendentes</span>
            <span className={`font-bold ${pendentes > 0 ? "text-yellow-400" : "text-zinc-500"}`}>{pendentes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Prêmio total</span>
            <span className="text-green-400 font-bold">R$ {premio.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Taxa de entrada</span>
            <span className="text-white font-bold">R$ {Number(bolao.entryFee).toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold">Palpites</p>
            <TogglePalpites bolaoId={bolao.id} isOpen={bolao.palpitesOpen} />
          </div>
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold">Próximo jogo</p>
            {proximoJogo ? (
              <p className="text-sm text-white font-semibold">
                {proximoJogo.homeTeam.shortName} × {proximoJogo.awayTeam.shortName}
              </p>
            ) : (
              <p className="text-sm text-zinc-500">Nenhum agendado</p>
            )}
          </div>
          <Link
            href={`/painel/boloes/${bolao.id}/jogos`}
            className="block text-center bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold py-2 rounded-lg transition-colors"
          >
            Lançar resultados →
          </Link>
        </div>
      </div>

      {/* Lista de participantes */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
          Participantes ({bolao.participations.length})
        </h2>
        <Link
          href={`/boloes/${bolao.id}/ranking`}
          target="_blank"
          className="text-xs text-green-400 hover:underline"
        >
          Ver ranking público →
        </Link>
      </div>

      <div className="space-y-2">
        {bolao.participations.map((p, i) => (
          <ParticipantRow
            key={p.id}
            participation={p}
            pos={bolao.participations.filter(x => x.paid).findIndex(x => x.id === p.id) + 1}
            entryFee={Number(bolao.entryFee)}
            pixKey={null}
          />
        ))}
      </div>
    </div>
  )
}
