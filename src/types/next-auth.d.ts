import type { DefaultSession, DefaultJWT } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      isSuperadmin: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    isSuperadmin: boolean
  }
}
