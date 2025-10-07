import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/auth/callback", "/auth/access-denied"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  const token = request.cookies.get("access_token")?.value

  if (!isPublicPath && !token) {
    const redirectTo = `${request.nextUrl.origin}/auth/callback`
    const loginUrl = `https://ai-call-summary-ap-batch-fjfxdsdhdkd5b7bt.centralus-01.azurewebsites.net?redirect_uri=${encodeURIComponent(
      redirectTo
    )}`
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
