import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    // Validate user (getUser() validates the JWT, unlike getSession())
    const { data: { user } } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Protected app routes
    const protectedRoutes = ['/receitas', '/despesas', '/cartoes', '/aplicacao', '/poupanca', '/criptomoedas', '/settings', '/checkout'];
    if (protectedRoutes.some(route => path.startsWith(route))) {
        if (!user) {
            return NextResponse.redirect(new URL('/cadastro', request.url));
        }
    }

    // Protected admin routes
    if (path.startsWith('/admin')) {
        if (!user) {
            // Not logged in - redirect to login
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            // Not admin - redirect to dashboard
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/auth/callback',
        '/admin/:path*',
        '/receitas/:path*',
        '/despesas/:path*',
        '/cartoes/:path*',
        '/aplicacao/:path*',
        '/poupanca/:path*',
        '/criptomoedas/:path*',
        '/settings/:path*',
        '/checkout/:path*',
    ],
};
