import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  const tenantId = "cmr7yruvd0000xskomfi6w1il"
  const userId = "superadmin-001"

  // 1. TenantMember ADMIN
  await db.tenantMember.upsert({
    where: { tenantId_userId: { tenantId, userId } },
    update: { role: "ADMIN" },
    create: { tenantId, userId, role: "ADMIN" },
  })
  console.log("✓ TenantMember ADMIN")

  // 2. Competição
  const competition = await db.competition.create({
    data: {
      name: "Brasileirão 2026",
      shortName: "BRAS26",
      country: "BR",
      formatType: "LIGA",
    },
  })
  console.log("✓ Competition:", competition.name)

  // 3. Times
  const teamsData = [
    { name: "Flamengo",     shortName: "FLA", country: "BR" },
    { name: "Palmeiras",    shortName: "PAL", country: "BR" },
    { name: "Atlético-MG",  shortName: "CAM", country: "BR" },
    { name: "Fluminense",   shortName: "FLU", country: "BR" },
    { name: "Corinthians",  shortName: "COR", country: "BR" },
    { name: "São Paulo",    shortName: "SPF", country: "BR" },
    { name: "Botafogo",     shortName: "BOT", country: "BR" },
    { name: "Grêmio",       shortName: "GRE", country: "BR" },
    { name: "Internacional", shortName: "INT", country: "BR" },
    { name: "Cruzeiro",     shortName: "CRU", country: "BR" },
  ]

  const teams: Record<string, { id: string }> = {}
  for (const t of teamsData) {
    const team = await db.team.create({ data: t })
    teams[t.shortName] = team
    console.log("✓ Team:", t.name)
  }

  // 4. Temporada
  const season = await db.season.create({
    data: {
      competitionId: competition.id,
      year: 2026,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-12-15"),
      status: "ACTIVE",
      formatConfig: { rounds: 38, groups: null },
    },
  })
  console.log("✓ Season: 2026")

  // 5. Jogos
  const now = new Date()
  const matchesData = [
    { home: "FLA", away: "PAL", round: 1, days: -7,  homeScore: 2, awayScore: 1, status: "FINISHED" },
    { home: "CAM", away: "FLU", round: 1, days: -7,  homeScore: 0, awayScore: 0, status: "FINISHED" },
    { home: "COR", away: "SPF", round: 2, days: 1,   homeScore: null, awayScore: null, status: "SCHEDULED" },
    { home: "BOT", away: "GRE", round: 2, days: 1,   homeScore: null, awayScore: null, status: "SCHEDULED" },
    { home: "INT", away: "CRU", round: 2, days: 2,   homeScore: null, awayScore: null, status: "SCHEDULED" },
    { home: "PAL", away: "CAM", round: 3, days: 8,   homeScore: null, awayScore: null, status: "SCHEDULED" },
    { home: "FLA", away: "BOT", round: 3, days: 8,   homeScore: null, awayScore: null, status: "SCHEDULED" },
    { home: "SPF", away: "INT", round: 3, days: 9,   homeScore: null, awayScore: null, status: "SCHEDULED" },
  ]

  for (const m of matchesData) {
    const kickoff = new Date(now)
    kickoff.setDate(kickoff.getDate() + m.days)
    kickoff.setHours(16, 0, 0, 0)

    await db.match.create({
      data: {
        seasonId: season.id,
        homeTeamId: teams[m.home].id,
        awayTeamId: teams[m.away].id,
        kickoffAt: kickoff,
        round: m.round,
        stage: "Fase de Grupos",
        status: m.status as "SCHEDULED" | "FINISHED",
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      },
    })
    console.log(`✓ Match R${m.round}: ${m.home} x ${m.away}`)
  }

  // 6. Bolão
  const bolao = await db.bolao.create({
    data: {
      tenantId,
      seasonId: season.id,
      name: "Bolão Brasileirão 2026",
      inviteSlug: "brasileirao-2026-teste",
      entryFee: 50,
      prizePct: 80,
      palpitesOpen: true,
      scoringConfig: { exact: 10, result: 5, wrong: 0 },
    },
  })
  console.log("✓ Bolão:", bolao.name)

  console.log("\n=== TUDO PRONTO ===")
  console.log("Painel:  https://brboloes.appbarcontrol.com.br/painel")
  console.log("Convite: https://brboloes.appbarcontrol.com.br/convite/brasileirao-2026-teste")
}

main()
  .catch((e) => { console.error(e.message); process.exit(1) })
  .finally(() => db.$disconnect())
