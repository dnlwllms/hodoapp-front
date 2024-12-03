import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import HttpRequest from './network/HttpRequest';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();

    const accessToken = (await cookies()).get('accessToken')?.value;

    if (accessToken) {
      res.headers.set('Authorization', `Bearer ${accessToken}`);

      await HttpRequest.get('/auth', undefined, {
        ...(accessToken && {
          Authorization: `Bearer ${accessToken}`,
        }),
      });
    } else {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return res;
  } catch (e) {
    console.error(e);

    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - icons (Icon pack svg files)
     *
     * Public Page:
     * - login
     * - sign-up
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icons|login|sign-up).*)',
  ],
};
