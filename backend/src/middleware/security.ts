import { Request, Response, NextFunction } from 'express';

// 알려진 봇 User-Agent 패턴
const BOT_PATTERNS = [
  /\bbot\b/i,  // 단어 경계를 사용하여 더 정확하게 매칭
  /\bcrawl/i,
  /\bspider\b/i,
  /\bscrape/i,
  /\bcurl\//i,  // curl/버전 형태만 매칭
  /\bwget\//i,  // wget/버전 형태만 매칭
  /python-requests/i,
  /headless/i,
  /phantom/i,
  /\bselenium\b/i,
  /puppeteer/i,
  /playwright/i,
  // axios는 제거 - 브라우저와 정상적인 서버 요청에서도 사용됨
];

// IP별 요청 추적 (메모리 기반 - 프로덕션에서는 Redis 권장)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const suspiciousIPs = new Set<string>();

// 요청 카운터 초기화 주기 (1분)
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 100;
const SUSPICIOUS_THRESHOLD = 200;

/**
 * Bot Detection Middleware
 * 의심스러운 User-Agent를 차단합니다
 */
export const botDetection = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('user-agent') || '';
  
  // User-Agent가 없는 경우 차단
  if (!userAgent) {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'User-Agent header is required' 
    });
  }
  
  // 알려진 봇 패턴 검사
  const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgent));
  if (isBot) {
    console.warn(`Blocked bot access from IP: ${req.ip}, User-Agent: ${userAgent}`);
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Automated access is not allowed' 
    });
  }
  
  next();
};

/**
 * IP-based Rate Limiting
 * IP별 요청 횟수를 추적하고 제한합니다
 */
export const ipRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  // 의심스러운 IP는 즉시 차단
  if (suspiciousIPs.has(ip)) {
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Your IP has been temporarily blocked due to suspicious activity' 
    });
  }
  
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  // 새로운 IP 또는 시간 창 만료
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { 
      count: 1, 
      resetTime: now + WINDOW_MS 
    });
    return next();
  }
  
  // 요청 횟수 증가
  record.count++;
  
  // 의심스러운 활동 감지
  if (record.count > SUSPICIOUS_THRESHOLD) {
    suspiciousIPs.add(ip);
    console.warn(`IP ${ip} added to suspicious list after ${record.count} requests`);
    
    // 1시간 후 자동 해제
    setTimeout(() => {
      suspiciousIPs.delete(ip);
      requestCounts.delete(ip);
    }, 60 * 60 * 1000);
    
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Your IP has been temporarily blocked due to suspicious activity' 
    });
  }
  
  // 일반 rate limit 체크
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ 
      error: 'Too many requests',
      message: `Maximum ${MAX_REQUESTS_PER_WINDOW} requests per minute exceeded. Please try again later.`,
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
  }
  
  next();
};

/**
 * Suspicious Pattern Detection
 * 의심스러운 요청 패턴을 감지합니다
 */
export const suspiciousPatternDetection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    // SQL Injection 시도 (URL에만 적용)
    /(\bSELECT\b.*\bFROM\b|\bUNION\b.*\bSELECT\b|\bDROP\b.*\bTABLE\b)/i,
    // XSS 시도 (URL에만 적용)
    /<script[^>]*>.*?<\/script>/gi,
    // Path Traversal (URL에만 적용)
    /\.\.[\/\\]/,
  ];
  
  const url = req.url;
  
  // URL에만 패턴 검사 적용 (body나 query는 정상적인 데이터일 수 있음)
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => {
    return pattern.test(url);
  });
  
  if (hasSuspiciousPattern) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    console.warn(`Suspicious pattern detected from IP: ${ip}, URL: ${url}`);
    
    return res.status(400).json({ 
      error: 'Bad request',
      message: 'Invalid request pattern detected' 
    });
  }
  
  next();
};

/**
 * Security Headers Middleware
 * 보안 헤더를 설정합니다
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  // Prevent browsers from performing DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  next();
};

/**
 * Cleanup old request records periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, WINDOW_MS);
