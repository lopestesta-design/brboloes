"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    email: "",
    whatsapp: "",
    password: "",
    confirmPassword: "",
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        nickname: form.nickname,
        email: form.email,
        whatsapp: form.whatsapp,
        password: form.password,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar conta.")
      return
    }

    router.push("/login?registered=1")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary">BRbolões</h1>
          <p className="text-muted-foreground text-sm mt-1">Crie sua conta gratuitamente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {[
            { id: "name", label: "Nome completo", type: "text", placeholder: "João Silva" },
            { id: "nickname", label: "Apelido (no bolão)", type: "text", placeholder: "Joãozinho" },
            { id: "email", label: "Email", type: "email", placeholder: "seu@email.com" },
            { id: "whatsapp", label: "WhatsApp (opcional)", type: "tel", placeholder: "(11) 99999-9999" },
            { id: "password", label: "Senha", type: "password", placeholder: "••••••••" },
            { id: "confirmPassword", label: "Confirmar senha", type: "password", placeholder: "••••••••" },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id} className="space-y-1">
              <label className="text-sm font-medium" htmlFor={id}>{label}</label>
              <input
                id={id}
                type={type}
                placeholder={placeholder}
                required={id !== "whatsapp"}
                value={form[id as keyof typeof form]}
                onChange={(e) => set(id, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{" "}
          <a href="/login" className="text-primary font-medium hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  )
}
