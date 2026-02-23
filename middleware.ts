import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

import { updateSession } from '@/utils/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

const handleIntl = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isLocalizedAdminRoute = /^\/(en|ar)\/admin(?:\/|$)/.test(pathname);
    const isAdminLoginRoute = /^\/(en|ar)\/admin\/login\/?$/.test(pathname);

    if (isLocalizedAdminRoute && !isAdminLoginRoute) {
        const adminSession = request.cookies.get("admin_session")?.value;
        if (!adminSession) {
            const locale = pathname.split("/")[1] || "en";
            const loginUrl = request.nextUrl.clone();
            loginUrl.pathname = `/${locale}/admin/login`;
            loginUrl.search = "";
            return NextResponse.redirect(loginUrl);
        }
    }

    // 1. Update Supabase session (refresh cookies)
    const response = await updateSession(request);

    // 2. If Supabase redirected (e.g. auth guard), return immediately
    if (response.status !== 200) {
        return response;
    }

    // 3. Run next-intl middleware
    const intlResponse = handleIntl(request);

    // 4. Copy cookies from Supabase response to intl response
    // This ensures that any set-cookie headers from Supabase are preserved
    response.cookies.getAll().forEach((cookie) => {
        intlResponse.cookies.set(cookie.name, cookie.value);
    });

    return intlResponse;
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(ar|en)/:path*', '/(ar|en)']
};
