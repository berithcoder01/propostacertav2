# Script para iniciar o Agente de Prospecção (LeadsOn)
# Execute: .\start-scraper.ps1

Write-Host "Iniciando Agente LeadsOn (Scraper)..." -ForegroundColor Green

# Verifica se node_modules existe
if (-Not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Verifica se o .env existe
if (-Not (Test-Path ".env")) {
    Write-Host "AVISO: Arquivo .env nao encontrado!" -ForegroundColor Red
    Write-Host "Copie .env.example para .env e configure o DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# Inicia o scraper
Write-Host "Scraper ativo e buscando leads..." -ForegroundColor Cyan
npm run scraper
