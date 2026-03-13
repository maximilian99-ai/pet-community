#!/bin/bash

# Pet Community - UX 평가 도구 설치 스크립트

echo "🚀 Pet Community UX 평가 도구 설치를 시작합니다..."

cd frontend

echo ""
echo "📦 필수 의존성 설치 중..."

# 접근성 테스트 도구
pnpm add -D @axe-core/playwright

# JSX 접근성 린팅
pnpm add -D eslint-plugin-jsx-a11y

# Lighthouse CI
pnpm add -D @lhci/cli

# Vercel Speed Insights (프로덕션 성능 모니터링)
pnpm add @vercel/speed-insights

echo ""
echo "✅ 모든 의존성이 설치되었습니다!"

echo ""
echo "🧪 설치 확인 중..."

# Playwright 브라우저 설치
pnpm exec playwright install chromium

echo ""
echo "✨ 설치가 완료되었습니다!"
echo ""
echo "다음 명령어로 테스트를 실행할 수 있습니다:"
echo ""
echo "  📊 Lighthouse 점수 측정:"
echo "     pnpm lighthouse:local"
echo ""
echo "  ♿ 접근성 테스트:"
echo "     pnpm test:a11y"
echo ""
echo "  🔍 ESLint 접근성 검사:"
echo "     pnpm lint:a11y"
echo ""
echo "📖 자세한 사용법:"
echo "   guide documents/UX_AND_ACCESSIBILITY_GUIDE.md"
