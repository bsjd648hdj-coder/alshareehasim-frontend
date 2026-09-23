import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

// CSP الثابت يُبنى مرة واحدة عند startup — بدون nonce لأن TikTokPixel يستخدم afterInteractive
const STATIC_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://maps.googleapis.com https://js.sentry-cdn.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.tiktok.com https://sc-static.net https://tr.snapchat.com https://*.snapchat.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' blob: data: https: http://localhost:5000",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' http://localhost:5000 https://*.vercel.app https://*.railway.app https://*.render.com https://*.onrender.com https://lamsa-simicard-backend.vercel.app https://alshareehasim.com https://sentry.io https://www.google-analytics.com https://maps.googleapis.com https://nominatim.openstreetmap.org https://analytics.tiktok.com https://*.tiktokw.us https://tr.snapchat.com https://*.snapchat.com https://sc-static.net",
  "frame-src 'self' https://www.google.com https://docs.google.com",
  "object-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

// Security headers ثابتة — تُحسب مرة واحدة
const SECURITY_HEADERS: [string, string][] = [
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['X-XSS-Protection', '1; mode=block'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)'],
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Maintenance mode redirect (تجاهل API و maintenance نفسها)
  if (
    process.env.MAINTENANCE_MODE === 'true' &&
    !pathname.startsWith('/maintenance') &&
    !pathname.startsWith('/api/')
  ) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  const response = NextResponse.next();

  // تطبيق CSP الثابت
  response.headers.set('Content-Security-Policy', STATIC_CSP);

  // باقي الـ security headers
  for (const [key, value] of SECURITY_HEADERS) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
