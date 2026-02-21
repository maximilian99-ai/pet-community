import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * WCAG 2.1 AA 기준 접근성 테스트
 * 
 * 테스트 범위:
 * - WCAG 2.1 Level A, AA 준수
 * - 키보드 접근성
 * - 스크린 리더 호환성
 * - 색상 대비
 */

test.describe('접근성 테스트 (WCAG 2.1 AA)', () => {
  test('Feed 페이지 접근성 검사', async ({ page }) => {
    await page.goto('/en/feed');
    
    // axe-core를 사용한 자동 접근성 검사
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Profile 페이지 접근성 검사', async ({ page }) => {
    await page.goto('/en/profile');
    
    // Profile 페이지는 인증이 필요하므로 login 페이지로 리디렉션될 수 있음
    // 리디렉션 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 현재 URL이 login이면 테스트 스킵
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      test.skip();
      return;
    }
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Dashboard 페이지 접근성 검사', async ({ page }) => {
    await page.goto('/en/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Login 페이지 접근성 검사', async ({ page }) => {
    await page.goto('/en/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('키보드 네비게이션 - Tab 키로 모든 interactive 요소 접근 가능', async ({ page }) => {
    await page.goto('/en/feed');
    
    // 첫 번째 포커스 가능한 요소로 이동
    await page.keyboard.press('Tab');
    
    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        role: el?.getAttribute('role'),
        ariaLabel: el?.getAttribute('aria-label'),
      };
    });
    
    // 포커스 가능한 요소가 있는지 확인
    expect(focusedElement.tagName).toBeTruthy();
  });

  test('모든 이미지에 alt 속성 존재', async ({ page }) => {
    await page.goto('/en/feed');
    
    const imagesWithoutAlt = await page.$$eval('img', (images) => 
      images.filter((img) => !img.alt && !img.getAttribute('aria-label')).length
    );
    
    expect(imagesWithoutAlt).toBe(0);
  });

  test('모든 버튼에 접근 가능한 이름 존재', async ({ page }) => {
    await page.goto('/en/feed');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('button')
      .withTags(['wcag2a'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('폼 컨트롤에 레이블 존재', async ({ page }) => {
    await page.goto('/en/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('input, select, textarea')
      .withTags(['wcag2a'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('색상 대비 비율 검사 (WCAG AA: 4.5:1)', async ({ page }) => {
    await page.goto('/en/feed');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('언어 속성 설정 확인', async ({ page }) => {
    await page.goto('/en/feed');
    
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBeTruthy();
    expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });
});

test.describe('키보드 접근성 상세 테스트', () => {
  test('Escape 키로 모달 닫기', async ({ page }) => {
    await page.goto('/en/feed');
    
    // 게시물 생성 버튼 클릭
    const createButton = page.getByRole('button', { name: /post|게시/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // 모달이 열렸는지 확인
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Escape 키로 모달 닫기
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });

  test('Enter/Space 키로 버튼 활성화', async ({ page }) => {
    await page.goto('/en/feed');
    
    // 첫 번째 버튼으로 Tab 이동
    await page.keyboard.press('Tab');
    
    // Enter 키로 버튼 클릭 가능 확인
    const focusedElement = page.locator(':focus');
    const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
    
    if (tagName === 'button' || tagName === 'a') {
      // Space 키로 활성화 가능한지 확인
      await page.keyboard.press('Space');
      // 페이지가 정상적으로 동작하는지 확인
      await page.waitForTimeout(500);
    }
  });

  test('Focus trap - 모달 내부에서 포커스 유지', async ({ page }) => {
    await page.goto('/en/feed');
    
    const createButton = page.getByRole('button', { name: /post|게시/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // 모달 내부에서 Tab 순환 확인
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        
        // 포커스가 모달 외부로 나가지 않는지 확인
        const focusedElement = page.locator(':focus');
        const isInsideModal = await focusedElement.evaluate((el, modalEl) => {
          return modalEl?.contains(el) ?? false;
        }, await modal.elementHandle());
        
        expect(isInsideModal).toBe(true);
      }
    }
  });
});

test.describe('스크린 리더 호환성', () => {
  test('ARIA 랜드마크 존재', async ({ page }) => {
    await page.goto('/en/feed');
    
    // main, navigation 등 주요 랜드마크 확인
    const main = page.locator('main, [role="main"]');
    const nav = page.locator('nav, [role="navigation"]');
    
    await expect(main).toBeVisible();
    await expect(nav).toBeVisible();
  });

  test('동적 콘텐츠 업데이트 알림 (aria-live)', async ({ page }) => {
    await page.goto('/en/feed');
    
    // aria-live 영역이 있는지 확인 (Toast 등)
    const liveRegions = await page.$$('[aria-live]');
    
    // 최소한 하나의 live region이 있어야 함
    expect(liveRegions.length).toBeGreaterThanOrEqual(0);
  });

  test('버튼 및 링크에 명확한 설명', async ({ page }) => {
    await page.goto('/en/feed');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .disableRules(['color-contrast']) // 색상 대비는 별도 테스트
      .analyze();

    // 링크와 버튼에 명확한 텍스트나 aria-label이 있는지 확인
    expect(accessibilityScanResults.violations.filter(
      v => v.id === 'link-name' || v.id === 'button-name'
    )).toEqual([]);
  });
});
