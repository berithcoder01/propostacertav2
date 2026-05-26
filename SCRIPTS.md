# 🚀 Scripts de Execução - PropostaCerta

Este projeto utiliza scripts PowerShell (`.ps1`) para facilitar o início de cada serviço.

## 📂 Estrutura de Scripts

### 1. `start-all.ps1` (Raiz)
Inicia **tudo** de uma vez (API + Frontend + Scraper).
```powershell
.\start-all.ps1
```
*Ideal para desenvolvimento local completo.*

### 2. `api/start-api.ps1`
Inicia apenas o **Backend** (Fastify + Prisma).
```powershell
cd api
.\start-api.ps1
```

### 3. `leadsOn/start-scraper.ps1`
Inicia o **Agente de Prospecção** (Scraper Google Maps).
```powershell
cd leadsOn
.\start-scraper.ps1
```

### 4. `start-frontend.ps1` (Raiz)
Inicia apenas o **Frontend** (Vite + React).
```powershell
.\start-frontend.ps1
```

## ⚙️ Pré-requisitos

1. **Node.js** instalado (v18+).
2. **Arquivos `.env`** configurados em `api/` e `leadsOn/`.
3. Permissão para executar scripts no PowerShell:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

## 🧪 Teste Rápido

Para testar o scraper imediatamente (ignorando o horário noturno):
```powershell
cd leadsOn
npm run scraper -- --force
```
