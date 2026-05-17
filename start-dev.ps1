# Start both API and Frontend in dev mode
# Usage: .\start-dev.ps1

Write-Host "🚀 Iniciando PropostaCerta em modo desenvolvimento..." -ForegroundColor Cyan
Write-Host ""

# Check node_modules
if (-not (Test-Path "$PSScriptRoot\node_modules")) {
    Write-Host "⚠️  Frontend: node_modules não encontrado. Executando npm install..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot"
    npm install
}

if (-not (Test-Path "$PSScriptRoot\api\node_modules")) {
    Write-Host "⚠️  API: node_modules não encontrado. Executando npm install..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\api"
    npm install
}

Write-Host ""
Write-Host "📡 Iniciando API (localhost:3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\api'; Write-Host 'API rodando...' -ForegroundColor Green; npm run dev 2>&1"

Start-Sleep -Seconds 3

Write-Host "🎨 Iniciando Frontend (localhost:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; Write-Host 'Frontend rodando...' -ForegroundColor Yellow; npm run dev 2>&1"

Write-Host ""
Write-Host "✅ Serviços iniciando em janelas separadas." -ForegroundColor Cyan
Write-Host "   API:      http://localhost:3000" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Se alguma janela fechar, execute npm run dev manualmente nela para ver o erro." -ForegroundColor Red
Write-Host ""
