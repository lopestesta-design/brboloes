const BASE_URL =
  process.env.ASAAS_ENV === "sandbox"
    ? "https://sandbox.asaas.com/api/v3"
    : "https://api.asaas.com/api/v3"

const API_KEY = process.env.ASAAS_API_KEY!

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: API_KEY,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Asaas ${path} → ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

export type AsaasCustomer = {
  id: string
  name: string
  email: string
  cpfCnpj?: string
}

export type AsaasCharge = {
  id: string
  status: string
  invoiceUrl: string
  billingType: string
  value: number
  netValue: number
  dueDate: string
}

export type AsaasPixQrCode = {
  encodedImage: string  // base64 PNG
  payload: string       // código copia e cola
  expirationDate: string
}

export async function upsertCustomer(data: {
  name: string
  email: string
  cpfCnpj?: string
}): Promise<AsaasCustomer> {
  // tenta buscar pelo email primeiro
  const search = await request<{ data: AsaasCustomer[] }>(
    `/customers?email=${encodeURIComponent(data.email)}&limit=1`
  )
  if (search.data.length > 0) return search.data[0]

  return request<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      cpfCnpj: data.cpfCnpj,
      notificationDisabled: true,
    }),
  })
}

export async function createPixCharge(data: {
  customerId: string
  value: number
  description: string
  externalReference: string // participation id
}): Promise<AsaasCharge> {
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3) // vence em 3 dias
  const dueDateStr = dueDate.toISOString().split("T")[0]

  return request<AsaasCharge>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: data.customerId,
      billingType: "PIX",
      value: data.value,
      dueDate: dueDateStr,
      description: data.description,
      externalReference: data.externalReference,
    }),
  })
}

export async function getPixQrCode(chargeId: string): Promise<AsaasPixQrCode> {
  return request<AsaasPixQrCode>(`/payments/${chargeId}/pixQrCode`)
}

export async function getCharge(chargeId: string): Promise<AsaasCharge> {
  return request<AsaasCharge>(`/payments/${chargeId}`)
}
