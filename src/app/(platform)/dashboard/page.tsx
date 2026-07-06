import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const participations = await db.participation.findMany({
    where: { userId: session.user.id },
    include: {
      bolao: {
        include: {
          tenant: true,
          season: { include: { competition: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="font-black text-xl text-green-400">BRbolões</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">Olá, {session.user.name}</span>
          <Link href="/api/auth/signout" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Sair</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Meus bolões</h1>

        {participations.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <p className="text-4xl mb-4">⚽</p>
            <p className="font-medium text-zinc-400">Você ainda não participa de nenhum bolão.</p>
            <p className="text-sm mt-1 text-zinc-600">Use um link de convite para entrar em um bolão.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {participations.map(({ bolao, paid, totalPoints, rankPosition }) => (
              <Link
                key={bolao.id}
                href={`/boloes/${bolao.id}`}
                className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{bolao.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {bolao.season.competition.name} · {bolao.season.year} · {bolao.tenant.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {paid ? (
                      <>
                        <p className="text-xl font-black text-white">{totalPoints} <span className="text-xs font-normal text-zinc-500">pts</span></p>
                        {rankPosition && (
                          <p className="text-xs text-zinc-500">{rankPosition}º lugar</p>
                        )}
                      </>
                    ) : (
                      <span className="text-xs bg-yellow-900 text-yellow-400 font-bold px-2 py-1 rounded-full">Aguardando pagamento</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
