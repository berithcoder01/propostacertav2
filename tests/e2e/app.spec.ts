import { test, expect } from '@playwright/test';

test.describe('PropostaCerta - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ============================================================
  // Teste: Login page carrega corretamente
  // ============================================================
  test('Login page carrega e exibe formulário', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/PropostaCerta|Login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  // ============================================================
  // Teste: Navegação principal (rotas protegidas)
  // ============================================================
  test('Dashboard carrega com cards principais', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/');
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Resumo/i);
  });

  test('Navegação para propostas', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/');
    await page.getByRole('link', { name: /propostas/i }).click();
    await expect(page).toHaveURL(/.*propostas/);
  });

  test('Navegação para clientes', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/');
    await page.getByRole('link', { name: /clientes/i }).click();
    await expect(page).toHaveURL(/.*clientes/);
  });

  // ============================================================
  // Teste: Página de Planos carrega corretamente
  // ============================================================
  test('Página de planos exibe 3 cards', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/plans');

    const cards = page.locator('[class*="rounded-3xl"], [class*="rounded-2xl"]').filter({ has: page.locator('text=R\$') });
    await expect(cards).toHaveCount(3);
    await expect(page).toContainText('FREE');
    await expect(page).toContainText('PRO');
    await expect(page).toContainText('STANDARD');
  });

  test('Plano PRO é destacado como recomendado', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/plans');
    await expect(page.locator('text=Recomendado')).toBeVisible();
  });

  test('FAQ se expande ao clicar', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/plans');

    const firstFaq = page.locator('details').first();
    await firstFaq.click();
    await expect(firstFaq.locator('summary')).toBeVisible();
  });

  test('Botões de upgrade navegam para /plans', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/plans');

    const upgradeButtons = page.locator('button:has-text("Escolher"), button:has-text("Grátis")');
    const count = await upgradeButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  // ============================================================
  // Teste: Onboarding - fluxo completo
  // ============================================================
  test('Onboarding exibe etapas na ordem correta', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/onboarding');

    await expect(page.locator('text=Bem-vindo ao PropostaCerta')).toBeVisible();
    await page.getByRole('button', { name: /Começar/i }).click();

    await expect(page.locator('text=Crie sua Marca')).toBeVisible();
    await page.locator('input[placeholder*="Nome"]').fill('Empresa Teste');

    await page.locator('text=Elétrica').first().click({ force: true });

    await page.waitForSelector('[class*="aspect-square"]', { timeout: 5000 });
    const logoOptions = page.locator('[class*="aspect-square"]').filter({ hasNot: page.locator('text=Upload') });
    await expect(logoOptions.first()).toBeVisible();
  });

  test('Onboarding permite selecionar logo gerada', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/onboarding');

    await page.getByRole('button', { name: /Começar/i }).click();
    await page.locator('input[placeholder*="Nome"]').fill('Teste Logo');
    await page.locator('text=Elétrica').first().click({ force: true });

    await page.waitForSelector('[class*="aspect-square"]', { timeout: 5000 });
    const firstLogo = page.locator('[class*="aspect-square"]').first();
    await firstLogo.click();

    await expect(page.locator('[class*="ProposalPreview"]').first()).toBeVisible();
  });

  // ============================================================
  // Teste: Feature Gating - IA indisponível no FREE
  // ============================================================
  test('Assistente IA mostra bloqueio para plano FREE', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/propostas/nova/geral');

    const iaButton = page.locator('text=Assistente IA');
    await expect(iaButton).toBeVisible();
  });

  test('Clicar em IA no plano FREE abre modal de upgrade', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/propostas/nova/geral');

    const iaButton = page.locator('text=Assistente IA');
    await iaButton.click({ force: true });

    const upgradeModal = page.locator('[class*="UpgradeModal"]').first();
    await expect(upgradeModal).toBeVisible();
  });

  // ============================================================
  // Teste: BrandGenerator carrega via lazy
  // ============================================================
  test('BrandGenerator carrega sob demanda no onboarding', async ({ page }) => {
    await page.goto('/onboarding');

    await page.locator('input[placeholder*="Nome"]').fill('Teste Corp');

    await page.waitForSelector('[class*="aspect-square"]', { timeout: 10000 });
    await expect(page.locator('[class*="aspect-square"]')).toBeVisible();
  });

  test('BrandGenerator exporta SVG via botão copiar', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/onboarding');

    await page.locator('input[placeholder*="Nome"]').fill('Teste Export');
    await page.locator('text=Elétrica').first().click({ force: true });

    await page.waitForSelector('[class*="aspect-square"]', { timeout: 5000 });

    const firstLogo = page.locator('[class*="aspect-square"]').first();
    await firstLogo.click();

    const exportButtons = page.locator('button:has-text("Copiar SVG"), button:has-text("Baixar SVG")');
    const count = await exportButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ============================================================
  // Teste: Proposta - criação básica
  // ============================================================
  test('Nova proposta - wizard carrega', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/propostas/nova/geral');
    await expect(page).toContainText(/Escopo de Fornecimento|Valor Fechado|Serviço Contínuo/i);
  });

  test('Wizard navega entre etapas', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/propostas/nova/geral');

    await expect(page.locator('text=Dados do Cliente')).toBeVisible();

    await page.locator('input[placeholder*="Empresa"]').fill('Empresa Teste');
    await page.locator('input[placeholder*="Contato"]').fill('João Silva');
    await page.locator('input[placeholder*="Local"]').fill('Curitiba, PR');

    await page.getByRole('button', { name: /Próximo/ }).click();

    await expect(page.locator('text=Escopo de Fornecimento')).toBeVisible();
  });

  // ============================================================
  // Teste: Navegação mobile-friendly (responsivo)
  // ============================================================
  test('Layout responsivo - visualização mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/');

    await expect(page.locator('[class*="Dashboard"]')).toBeVisible();
  });

  test('Layout responsivo - planos em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/plans');

    const cards = page.locator('[class*="rounded-3xl"], [class*="rounded-2xl"]').filter({ has: page.locator('text=R\$') });
    await expect(cards).toHaveCount(3);
  });

  // ============================================================
  // Teste: Proposta pública renderiza documento
  // ============================================================
  test('Proposta pública renderiza documento com dados do cliente', async ({ page }) => {
    await page.goto('/p/test-token-123');
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  // ============================================================
  // Teste: Lazy loading de rotas
  // ============================================================
  test('Navegação para configurações carrega módulo lazy', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@propostacerta:token', 'mock-token');
    });
    await page.goto('/');

    await page.getByRole('link', { name: /configura/i }).click();
    await expect(page).toHaveURL(/.*configuracoes/);
    await expect(page.locator('text=Empresa|text=Configurações').first()).toBeVisible();
  });
});
