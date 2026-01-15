import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/auth/refresh', '/signup']

// Admin-only routes
const adminRoutes = ['/admin']

export function proxy(request: NextRequest) {
    let pathname = request.nextUrl.pathname
    if (pathname.endsWith('/') && pathname !== '/') {
        pathname = pathname.slice(0, -1)
    }
    console.log('Middleware Path (Normalized):', pathname)

    // 1. Allow public routes immediately
    const isPublic = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )
    console.log('Is Public:', isPublic)

    if (isPublic) {
        return NextResponse.next()
    }

    // 2. Auth check for protected routes
    const token = request.cookies.get('auth_token')?.value
    console.log('Has Token:', !!token)

    if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // 3. Admin-specific route handling
    const isAdminRoute = adminRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )

    if (isAdminRoute) {
        // The token is present, client-side RequireRole component handles actual role validation
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
