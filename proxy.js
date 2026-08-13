import { NextResponse } from 'next/server';

export function proxy(request) {
  const host = request.headers.get('host') || '';
  
  // Check if the request is coming from the old subdomains
  if (
    host.includes('4567.rsamdio') || 
    host.includes('45678.rsamdio')
  ) {
    const targetUrl = new URL(request.url);
    targetUrl.host = 'insights.rsamdio.org';
    // If running in development with custom ports, we force https for the live target
    if (!targetUrl.protocol.startsWith('https')) {
      targetUrl.protocol = 'https';
    }
    return NextResponse.redirect(targetUrl, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  // Run middleware on all paths except static files, API, and Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
