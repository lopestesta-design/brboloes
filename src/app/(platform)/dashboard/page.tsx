import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const memberships = await db.tenantMember.findMany({
    where: { userId: session.user.id },
    include: {
      tenant: {
        include: {
          boloes: {
            where: { active: true },
            include: { season: { include: { competition: true } } },
          },
        },
      },
    },
  })

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-black text-xl text-primary">BRbolões</span>
        <span className="text-sm text-muted-foreground">Olá, {session.user.name}</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Meus bolões</h1>

        {memberships.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-4">⚽</p>
            <p className="font-medium">Você ainda não participa de nenhum bolão.</p>
            <p className="text-sm mt-1">Use um link de convite para entrar em um bolão.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {memberships.map(({ tenant }) =>
              tenant.boloes.map((bolao) => (
                <a
                  key={bolao.id}
                  href={`/boloes/${bolao.id}`}
                  className="block border rounded-xl p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{bolao.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bolao.season.competition.name} · {bolao.season.year}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">{tenant.name}</span>
                  </div>
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}
