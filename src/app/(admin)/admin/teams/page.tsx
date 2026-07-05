import { db } from "@/lib/db"
import Link from "next/link"

export default async function TeamsPage() {
  const teams = await db.team.findMany({ orderBy: [{ country: "asc" }, { name: "asc" }] })

  const byCountry = teams.reduce<Record<string, typeof teams>>((acc, t) => {
    if (!acc[t.country]) acc[t.country] = []
    acc[t.country].push(t)
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Times</h1>
          <p className="text-zinc-400 text-sm mt-1">{teams.length} cadastrado(s)</p>
        </div>
        <Link
          href="/admin/teams/novo"
          className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + Novo time
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-4">⚽</p>
          <p>Nenhum time cadastrado.</p>
          <Link href="/admin/teams/novo" className="text-green-400 hover:underline text-sm mt-2 inline-block">
            Cadastrar o primeiro →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCountry).map(([country, list]) => (
            <div key={country}>
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{country}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {list.map((t) => (
                  <Link
                    key={t.id}
                    href={`/admin/teams/${t.id}`}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3 hover:border-zinc-600 transition-colors"
                  >
                    {t.logoUrl ? (
                      <img src={t.logoUrl} alt={t.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 bg-zinc-700 rounded-full" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-zinc-500">{t.shortName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
