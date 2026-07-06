const BASE_URL = process.env.EVOLUTION_API_URL ?? "http://localhost:8080"
const API_KEY = process.env.EVOLUTION_API_KEY ?? ""
const INSTANCE = process.env.EVOLUTION_INSTANCE ?? "tonel333"

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("55") && digits.length >= 12) return digits
  if (digits.length === 11 || digits.length === 10) return `55${digits}`
  return digits
}

async function sendText(phone: string, text: string): Promise<void> {
  const number = formatPhone(phone)
  try {
    await fetch(`${BASE_URL}/message/sendText/${INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: API_KEY },
      body: JSON.stringify({ number, text }),
    })
  } catch {
    // Falha silenciosa — notificação não pode bloquear o fluxo principal
  }
}

export async function notifyPaymentConfirmed(data: {
  phone: string | null
  name: string
  bolaoName: string
  platformUrl: string
  bolaoId: string
}) {
  if (!data.phone) return
  await sendText(
    data.phone,
    `✅ *Pagamento confirmado!*\n\nOlá, ${data.name}! Seu pagamento para o bolão *${data.bolaoName}* foi confirmado.\n\nFaça seus palpites agora:\n${data.platformUrl}/boloes/${data.bolaoId}`
  )
}

export async function notifyMatchResult(data: {
  phone: string | null
  name: string
  bolaoName: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  points: number
  rankPosition: number | null
  platformUrl: string
  bolaoId: string
}) {
  if (!data.phone) return
  const rankText = data.rankPosition ? `\n📊 Você está em *${data.rankPosition}º lugar*!` : ""
  await sendText(
    data.phone,
    `⚽ *Resultado lançado!*\n\n${data.homeTeam} *${data.homeScore} × ${data.awayScore}* ${data.awayTeam}\n\nVocê fez *${data.points} pontos* neste jogo.${rankText}\n\nVeja o ranking completo:\n${data.platformUrl}/boloes/${data.bolaoId}/ranking`
  )
}

export async function notifyBolaoInvite(data: {
  phone: string
  organizerName: string
  bolaoName: string
  inviteUrl: string
  entryFee: number
}) {
  await sendText(
    data.phone,
    `🏆 *Convite para bolão!*\n\n*${data.organizerName}* te convidou para participar do bolão *${data.bolaoName}*.\n\n💰 Taxa de entrada: R$ ${data.entryFee.toFixed(2)}\n\nParticipe agora:\n${data.inviteUrl}`
  )
}

export async function notifyPalpitesOpen(data: {
  phone: string | null
  name: string
  bolaoName: string
  platformUrl: string
  bolaoId: string
}) {
  if (!data.phone) return
  await sendText(
    data.phone,
    `🎯 *Palpites liberados!*\n\nOlá, ${data.name}! Os palpites do bolão *${data.bolaoName}* estão abertos.\n\nFaça seus palpites antes de fechar:\n${data.platformUrl}/boloes/${data.bolaoId}/palpites`
  )
}
