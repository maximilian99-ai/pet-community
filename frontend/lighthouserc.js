module.exports = {
  ci: {
    collect: {
      // Lighthouse 테스트할 URL 설정 - 모든 언어 지원
      url: [
        // English
        'http://localhost:3000/en/feed',
        'http://localhost:3000/en/profile',
        'http://localhost:3000/en/dashboard',
        // Korean
        'http://localhost:3000/ko/feed',
        'http://localhost:3000/ko/profile',
        'http://localhost:3000/ko/dashboard',
        // French
        'http://localhost:3000/fr/feed',
        'http://localhost:3000/fr/profile',
        'http://localhost:3000/fr/dashboard',
        // German
        'http://localhost:3000/de/feed',
        'http://localhost:3000/de/profile',
        'http://localhost:3000/de/dashboard',
        // Spanish
        'http://localhost:3000/es/feed',
        'http://localhost:3000/es/profile',
        'http://localhost:3000/es/dashboard',
        // Dutch
        'http://localhost:3000/nl/feed',
        'http://localhost:3000/nl/profile',
        'http://localhost:3000/nl/dashboard',
        // Danish
        'http://localhost:3000/da/feed',
        'http://localhost:3000/da/profile',
        'http://localhost:3000/da/dashboard',
      ],
      // 각 URL을 3번 테스트하여 평균값 사용
      numberOfRuns: 3,
      settings: {
        // 모바일 디바이스 에뮬레이션
        preset: 'desktop',
      },
    },
    assert: {
      // 최소 점수 기준 설정
      assertions: {
        'categories:performance': ['warn', { minScore: 0.4 }],
        'categories:accessibility': ['error', { minScore: 0.8 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        // 특정 Lighthouse 감사 항목 설정
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 8000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.2 }],
        'total-blocking-time': ['warn', { maxNumericValue: 1000 }],
        // 접근성 필수 항목
        'color-contrast': 'warn',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'html-has-lang': 'warn',
        'valid-lang': 'warn',
      },
    },
    upload: {
      // Lighthouse CI 서버에 업로드 (선택사항)
      target: 'temporary-public-storage',
    },
  },
};
