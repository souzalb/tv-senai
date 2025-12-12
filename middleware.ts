import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Verify env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Middleware: Missing Supabase Environment Variables');
    }

    const supabase = createServerClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseKey || 'placeholder-key',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    let user = null;
    const isPlaceholder = !supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || !supabaseKey || supabaseKey === 'placeholder-key';

    if (!isPlaceholder) {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            user = data.user;
        } catch (err: any) {
            console.error('Middleware: Error fetching user. verify your Supabase credentials and network connection.');
            console.error('Error Details:', err.message || err);
        }
    }

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect /login to /admin if already logged in
    if (request.nextUrl.pathname === '/login') {
        if (user) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
