import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ko', 'es', 'fr', 'de', 'nl', 'da'],
  // Used when no locale matches
  defaultLocale: 'en'
});

// Bot detection patterns (더 엄격한 패턴 사용)
const BOT_PATTERNS = [
  /\bbot\b/i,
  /\bcrawl/i,
  /\bspider\b/i,
  /\bscrape/i,
  /\bcurl\//i,
  /\bwget\//i,
  /python-requests/i,
  /headless/i,
  /phantom/i,
  /\bselenium\b/i,
  /puppeteer/i,
  /playwright/i,
];

// Rate limiting store (in-memory, resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Security middleware
function securityMiddleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Check for missing User-Agent
  if (!userAgent) {
    return NextResponse.json(
      { error: 'Access denied', message: 'User-Agent header is required' },
      { status: 403 }
    );
  }
  
  // Bot detection
  const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgent));
  if (isBot) {
    console.warn(`Blocked bot access from IP: ${ip}, User-Agent: ${userAgent}`);
    return NextResponse.json(
      { error: 'Access denied', message: 'Automated access is not allowed' },
      { status: 403 }
    );
  }
  
  // Rate limiting (100 requests per minute per IP)
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;
  
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    record.count++;
    
    if (record.count > maxRequests) {
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((record.resetTime - now) / 1000))
          }
        }
      );
    }
  }
  
  return null; // No security issues, continue
}

export default function middleware(request: NextRequest) {
  // Apply security checks first
  const securityResponse = securityMiddleware(request);
  if (securityResponse) {
    return securityResponse;
  }
  
  // Then apply internationalization
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ko|en|es|fr|de|nl|da)/:path*']
};
