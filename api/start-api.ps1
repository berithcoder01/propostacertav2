# Script para iniciar o Servidor Backend (API PropostaCerta)
# Execute: .\start-api.ps1

Write-Host "Iniciando API do PropostaCerta..." -ForegroundColor Green

# Verifica se node_modules existe
if (-Not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Inicia o servidor em modo desenvolvimento
Write-Host "Servidor rodando em http://localhost:3000" -ForegroundColor Cyan
npm run dev
