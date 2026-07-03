import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/cadastro")
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/financeiro") || pathname.startsWith("/tenants") || pathname.startsWith("/seasons") || pathname.startsWith("/matches")
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/boloes") || pathname.startsWith("/palpites") || pathname.startsWith("/ranking")

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAdminRoute && isLoggedIn && !req.auth?.user?.isSuperadmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
