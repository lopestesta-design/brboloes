import { db } from "@/lib/db"
import Link from "next/link"

export default async function TenantsPage() {
  const tenants = await db.tenant.findMany({
    include: { _count: { select: { members: true, boloes: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Tenants</h1>
          <p className="text-zinc-400 text-sm mt-1">{tenants.length} cadastrado(s)</p>
        </div>
        <Link
          href="/admin/tenants/novo"
          className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + Novo tenant
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-4">🏢</p>
          <p>Nenhum tenant cadastrado ainda.</p>
          <Link href="/admin/tenants/novo" className="text-green-400 hover:underline text-sm mt-2 inline-block">
            Criar o primeiro tenant →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map((t) => (
            <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                  style={{ backgroundColor: t.primaryColor }}
                >
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500">/{t.slug} · {t._count.members} membros · {t._count.boloes} bolões</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.active ? "bg-green-900 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
                  {t.active ? "Ativo" : "Inativo"}
                </span>
                <Link
                  href={`/admin/tenants/${t.id}`}
                  className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
