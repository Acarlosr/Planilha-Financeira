import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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

    // Protected premium routes (requires active subscription)
    const premiumRoutes = ['/export', '/api-access', '/advanced-reports'];
    if (premiumRoutes.some(route => path.startsWith(route))) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('subscription_status, subscription_plan:subscription_plans(slug)')
            .eq('id', user.id)
            .single();

        const isActive = profile?.subscription_status === 'active' || profile?.subscription_status === 'trial';
        const planSlug = (profile?.subscription_plan as any)?.slug;

        // Free plan can't access premium routes
        if (!isActive || planSlug === 'free') {
            return NextResponse.redirect(new URL('/pricing?upgrade=required', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/auth/callback',
        '/admin/:path*',
        '/export/:path*',
        '/api-access/:path*',
        '/advanced-reports/:path*',
    ],
};
