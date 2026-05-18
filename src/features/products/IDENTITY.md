# Módulo: Produtos e Serviços (Controle de Estoque)

## Identidade
Sistema unificado de cadastro e controle de produtos e serviços com gestão de estoque, alertas de nível mínimo e integração direta com propostas comerciais. Diferencia produtos (com estoque) de serviços (sem estoque) através do campo `isProduct`.

## Estrutura Interna
```
products/
├── ProductsPage.jsx              # Página principal: header, stats, alertas, lista
── components/
│   ├── ProductCard.jsx           # Card individual com indicador de estoque baixo
│   ├── ProductList.jsx           # Lista com tabs (Todos/Produtos/Serviços/Baixo), busca, paginação
│   ├── ProductFormModal.jsx      # Modal de criação/edição com toggle produto/serviço
│   └── StockAlert.jsx            # Banner de alerta quando itens estão abaixo do mínimo
├── services/
│   └── productService.js         # Cliente API: fetchProducts, updateStock, deleteProduct, etc.
```

## Modelos de Dados (Prisma)
### CatalogItem
Modelo unificado para produtos E serviços.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String | UUID |
| `companyId` | String | FK → Company |
| `code` | String? | Código/SKU do item |
| `description` | String | Nome/descrição do item |
| `unit` | String | Unidade (UN, KG, M, H, etc.) |
| `category` | String | Categoria (MATERIAL, SERVICO, etc.) |
| `defaultPrice` | Float? | Preço padrão |
| `notes` | String? | Observações |
| `active` | Boolean | Soft delete (default: true) |
| `isProduct` | Boolean | **true = produto com estoque, false = serviço** |
| `stockQuantity` | Int | Quantidade em estoque (default: 0) |
| `minStock` | Int | Nível mínimo de alerta (default: 5) |
| `imageUrl` | String? | URL da imagem |
| `embedding` | Float[] | Vetor 1536 para busca semântica (IA) |
| `suggestedPrice` | Float? | Preço sugerido por IA |
| `priceUpdateCount` | Int | Contador de atualizações de preço |

### ProposalItem
Itens dentro de uma proposta, referenciando CatalogItem.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `catalogId` | String? | FK → CatalogItem (opcional) |
| `label` | String | Descrição do item na proposta |
| `unit` | String | Unidade |
| `quantity` | Float | Quantidade |
| `unitPrice` | Float | Preço unitário |
| `subtotal` | Float | Subtotal calculado |
| `category` | String | Categoria |
| `isProduct` | Boolean | Replicado do CatalogItem |
| `stockReserved` | Int | **Quantidade reservada no estoque** |
| `sortOrder` | Int | Ordem de exibição |

## Rotas da API

### /products (Controle de Estoque)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/products` | Lista com filtros (isProduct, category, lowStock, search, paginação) |
| GET | `/products/low-stock` | Itens com estoque abaixo do mínimo |
| GET | `/products/stats` | Estatísticas: total produtos, serviços, baixo estoque, valor em estoque |
| GET | `/products/:id` | Detalhes de um item |
| POST | `/products` | Criar produto ou serviço |
| PUT | `/products/:id` | Atualizar item |
| PATCH | `/products/:id/stock` | Ajustar estoque (add/remove/set) |
| DELETE | `/products/:id` | Inativação (soft delete) |

### /catalog (Catálogo para Propostas)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/catalog` | Lista todos os itens ativos (filtro isProduct, category, search) |
| POST | `/catalog` | Criar item |
| PUT | `/catalog/:id` | Atualizar item |
| DELETE | `/catalog/:id` | Inativação (soft delete) |
| POST | `/catalog/seed` | Popular catálogo padrão do segmento (~85 itens pré-cadastrados) |
| POST | `/catalog/search` | Busca semântica com IA (Gemini) |

## Conexões com Propostas

### Fluxo de Integração
1. **Cadastro**: Itens são criados em Produtos e Serviços com `isProduct` definido
2. **Proposta**: Wizard de propostas busca catálogo via `/catalog` ou `/products`
3. **Adição**: `addFromCatalog()` copia dados do CatalogItem para o item da proposta, incluindo `isProduct`
4. **Salvamento**: `saveProposal()` envia `isProduct` para o backend
5. **Reserva de Estoque**:
   - Proposta criada como **APPROVED**: estoque é decrementado imediatamente
   - Proposta em **DRAFT/SENT**: `stockReserved` é registrado, estoque não alterado
   - Status muda para **APPROVED**: estoque decrementado
   - Status muda de **APPROVED** para **REJECTED/EXPIRED**: estoque liberado (incrementado)
   - Proposta **deletada** estando APPROVED: estoque liberado
6. **Validação**: Antes de criar proposta APPROVED, verifica disponibilidade (`stockQuantity - stockReserved >= requested`)

### Regras de Estoque
- Apenas itens com `isProduct: true` possuem controle de estoque
- `stockQuantity` nunca pode ser negativo (floor em 0)
- `minStock` nunca pode ser negativo (floor em 0)
- Serviços (`isProduct: false`) ignoram campos de estoque
- Estoque disponível = `stockQuantity - stockReserved`

## Dependências Externas
- `react` (useState, useEffect, useCallback)
- `framer-motion` (motion, AnimatePresence)
- `lucide-react` (ícones: Package, TrendingUp, AlertTriangle, DollarSign)
- `../../shared/context/ToastContext` (notificações)
- `./services/productService` (cliente API)

## Conexões com o Sistema
| Arquivo | Importado por | Caminho |
|---------|--------------|---------|
| `ProductsPage` | `Layout.jsx` (rota `/produtos`) | `../features/products/ProductsPage` |
| `productService` | `ProductsPage.jsx` | interno |

## Como Transplantar
1. Copiar pasta `products/` inteira
2. Atualizar import do `ToastContext` se necessário
3. Importar: `import ProductsPage from './products/ProductsPage'`
4. Dependências npm necessárias: `framer-motion`, `lucide-react`
5. Garantir modelo `CatalogItem` e `ProposalItem` no schema Prisma

## Funcionalidades
- **Unificação produto/serviço**: mesmo modelo com flag `isProduct`
- **Controle de estoque**: add/remove/set com validação de não-negativo
- **Alertas visuais**: cards com borda vermelha quando estoque ≤ mínimo
- **Banner de alerta**: mostra até 5 itens com estoque baixo + link "Ver todos"
- **Dashboard de stats**: total produtos, serviços, itens baixo estoque, valor em estoque
- **Tabs de filtro**: Todos, Produtos, Serviços, Estoque Baixo
- **Busca**: por descrição ou código (case-insensitive)
- **Paginação**: 12 itens por página
- **Soft delete**: inativação em vez de exclusão permanente
- **Seed por segmento**: catálogo pré-populado com ~85 itens para 6 segmentos
- **Busca semântica IA**: Gemini analisa contexto técnico e sinônimos
- **Integração com propostas**: itens do catálogo aparecem no wizard com info de estoque
- **Reserva automática**: estoque reservado ao aprovar proposta, liberado ao rejeitar
