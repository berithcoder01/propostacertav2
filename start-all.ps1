# Script Mestre - Inicia todo o ecossistema NaroGestor
# Execute: .\start-all.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando NaroGestor Completo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Iniciar API (Backend)
Write-Host "`n[1/3] Iniciando API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api; .\start-api.ps1"

# Aguarda um pouco para a API subir
Start-Sleep -Seconds 3

# 2. Iniciar Frontend
Write-Host "[2/3] Iniciando Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\start-frontend.ps1"

# 3. Iniciar Scraper (LeadsOn)
Write-Host "[3/3] Iniciando Agente LeadsOn..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd leadsOn; .\start-scraper.ps1"

Write-Host "`nTodos os servicos foram iniciados em janelas separadas!" -ForegroundColor Cyan
Write-Host "   - API: http://localhost:3000" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   - Scraper: Rodando em background" -ForegroundColor White
