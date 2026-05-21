import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEV_SECRET = 'dev-insecure-session-secret';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SESSION_SECRET || DEV_SECRET;
  const session = request.cookies.get('admin_session')?.value;
  if (session !== secret) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
