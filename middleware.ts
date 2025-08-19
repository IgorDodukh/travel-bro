import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Clone the request headers and set a new header `x-version`
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-version', '1')

    // You can also set request headers in NextResponse.rewrite
    const response = NextResponse.next({
        request: {
            // New request headers
            headers: requestHeaders,
        },
    })

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*') // Allow any origin
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

    return response
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/api/:path*',
}