import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url)
  
  // Protect dashboard and admin routes
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/admin') || 
      pathname.startsWith('/api/relatorio')) {
    
    const session = await auth()
    
    if (!session) {
      // Redirect to login for protected routes
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // API routes with token authentication
  if (pathname.startsWith('/api/temperaturas')) {
    // Allow POST with token, GET needs session
    if (req.method === 'POST') {
      return NextResponse.next()
    }
    
    // GET needs session
    const session = await auth()
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // API admin routes - require session
  if (pathname.startsWith('/api/admin')) {
    const session = await auth()
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/temperaturas',
    '/api/relatorio',
    '/api/admin/clear-temperatures'
  ]
}
