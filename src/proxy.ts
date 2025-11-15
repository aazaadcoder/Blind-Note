import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export { default } from "next-auth/middleware"

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {

    const token = await getToken({ req: request }); // Takes a NextAuth.js request (req) and returns either the NextAuth.js issued JWT's payload, or the raw JWT string. We look for the JWT in the either the cookies, or the Authorization header. 
    const url = request.nextUrl;

    // redirection policy 
    if (token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up') ||
        url.pathname.startsWith('/verify') ||
        url.pathname.startsWith('/')
    )) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));

    }

    // return NextResponse.redirect(new URL('/dashboard', request.url))
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

// config lists all the paths where the middleware need to be applied to 
export const config = {
    matcher: [
        '/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',  // all paths inside dashboard 
        '/verify/:path*',
    ],
}
