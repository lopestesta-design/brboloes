import type { NextAuthConfig } from "next-auth"

// Config leve para o middleware — sem banco, sem adapter
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/cadastro")
      const isAdminRoute = pathname.startsWith("/admin")
      const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/boloes") ||
        pathname.startsWith("/palpites") ||
        pathname.startsWith("/ranking")

      if (isAuthRoute && isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl))
      if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) return Response.redirect(new URL("/login", nextUrl))
      if (isAdminRoute && isLoggedIn && !auth?.user?.isSuperadmin) return Response.redirect(new URL("/dashboard", nextUrl))

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isSuperadmin = (user as { isSuperadmin?: boolean }).isSuperadmin ?? false
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.isSuperadmin = token.isSuperadmin as boolean
      return session
    },
  },
  providers: [], // providers ficam só no auth.ts completo
  session: { strategy: "jwt" },
}
