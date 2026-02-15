import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

import { updateSession } from '@/utils/supabase/middleware';
import { NextRequest } from 'next/server';

const handleIntl = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
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
    matcher: ['/', '/(ar|en)/:path*']
};
