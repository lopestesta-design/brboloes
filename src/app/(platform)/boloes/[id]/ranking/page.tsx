import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function RankingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id: bolaoId } = await params

  const bolao = await db.bolao.findUnique({
    where: { id: bolaoId },
    include: {
      season: { include: { competition: true } },
      participations: {
        where: { paid: true },
        include: { user: { select: { id: true, nickname: true, name: true } } },
        orderBy: { totalPoints: "desc" },
      },
    },
  })

  if (!bolao) notFound()

  const myUserId = session?.user?.id

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-black text-white">{bolao.name}</h1>
            <p className="text-xs text-zinc-500">{bolao.season.competition.name} {bolao.season.year}</p>
          </div>
          {myUserId && (
            <Link href={`/boloes/${bolaoId}/palpites`} className="text-sm text-green-400 hover:underline">⚽ Palpites</Link>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-white mb-4">📊 Ranking</h2>

        {bolao.participations.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <p>Nenhum participante pago ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bolao.participations.map((p, i) => {
              const pos = i + 1
              const isMe = p.userId === myUserId
              const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : null

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 rounded-xl px-5 py-4 border transition-colors ${
                    isMe
                      ? "bg-green-950 border-green-700"
                      : "bg-zinc-900 border-zinc-800"
                  }`}
                >
                  <div className="w-8 text-center">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="text-zinc-500 font-bold text-sm">{pos}º</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">
                      {p.user.nickname}
                      {isMe && <span className="ml-2 text-xs text-green-400">(você)</span>}
                    </p>
                    <p className="text-xs text-zinc-500">{p.user.name}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-black text-white">{p.totalPoints}</p>
                    <p className="text-xs text-zinc-500">pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Link href="/dashboard" className="block text-center text-zinc-500 hover:text-zinc-300 text-sm mt-8 transition-colors">
          ← Voltar ao dashboard
        </Link>
      </div>
    </div>
  )
}
