# Script para iniciar o Frontend (PropostaCerta)
# Execute: .\start-frontend.ps1

Write-Host "Iniciando Frontend do PropostaCerta..." -ForegroundColor Green

# Verifica se node_modules existe
if (-Not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Inicia o servidor de desenvolvimento
Write-Host "Frontend rodando em http://localhost:5173" -ForegroundColor Cyan
npm run dev
