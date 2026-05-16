# 🛠️ Guia de Manutenção de Modelos de Proposta

Este diretório contém os templates HTML utilizados pelo motor de geração de PDF da PropostaCerta. Qualquer alteração nestes arquivos deve seguir rigorosamente as regras abaixo para evitar a quebra da funcionalidade de injeção de dados.

## 1. Variáveis Dinâmicas (Placeholders)
Os placeholders utilizam o formato `{{NOME_DA_VARIAVEL}}`. Eles são substituídos em tempo de execução pelo `templateEngine.js`.

### Empresa (Emitente)
- `{{COMPANY_NAME}}`: Nome da empresa.
- `{{COMPANY_SLOGAN}}`: Slogan ou frase de efeito.
- `{{COMPANY_CNPJ}}`, `{{COMPANY_PHONE}}`, `{{COMPANY_EMAIL}}`, `{{COMPANY_WEBSITE}}`.
- `{{COMPANY_ADDRESS}}`, `{{COMPANY_CITY}}`, `{{COMPANY_STATE}}`.
- `{{LOGO_URL}}`: URL da logo (geralmente injetada como Base64 para o PDF).
- `{{PIX_KEY}}`: Chave PIX da empresa.
- `{{FOOTER_NOTE}}`: Nota de rodapé configurada pela empresa.

### Cliente (Destinatário)
- `{{CLIENT_NOME}}`: Nome do cliente ou razão social.
- `{{CLIENT_CONTATO}}`: Nome da pessoa de contato.
- `{{CLIENT_CARGO}}`: Cargo do contato.
- `{{CLIENT_LOCAL}}`: Endereço da obra ou cidade.
- `{{CLIENT_TEL}}`: Telefone do cliente.
- `{{CLIENT_OBJETO}}`: Descrição resumida do objeto da proposta.

### Dados da Proposta
- `{{PROPOSAL_NUM}}`: Número identificador da proposta.
- `{{PROPOSAL_DATE}}`: Data formatada (ex: 16 de maio de 2024).
- `{{TOTAL_AMOUNT}}`: Valor total formatado em R$ (ex: R$ 1.250,00).

### Condições Comerciais
- `{{COND_VALIDADE}}`: Dias de validade.
- `{{COND_PRAZO_EXEC}}`: Prazo de execução/entrega.
- `{{COND_FORMA_PAGAMENTO}}`: Texto descritivo da forma de pagamento.
- `{{COND_ENTRADA}}`: % ou valor de entrada.
- `{{COND_PRAZO_ENTRADA}}`: Dias para pagamento da entrada.
- `{{COND_MEDICAO}}`, `{{COND_PRAZO_NF}}`.
- `{{COND_WARRANTY_PERIOD}}`, `{{COND_WARRANTY_TYPE}}`.
- `{{COND_OBS}}`: Observações gerais da proposta.

---

## 2. Blocos Lógicos (Comentários de Controle)
O motor usa comentários HTML para incluir ou remover seções inteiras. **Nunca remova ou renomeie estes comentários.**

- `<!-- IF_PIX --> ... <!-- ENDIF_PIX -->`: Exibe o conteúdo apenas se houver chave PIX.
- `<!-- IF_PAGAMENTO --> ... <!-- ENDIF_PAGAMENTO -->`: Exibe/esconde seção de condições de pagamento.
- `<!-- IF_GARANTIA --> ... <!-- ENDIF_GARANTIA -->`: Exibe/esconde seção de garantias.
- `<!-- IF_OBS --> ... <!-- ENDIF_OBS -->`: Exibe apenas se houver observações preenchidas.

---

## 3. Tabela de Itens (Obrigatório)
O motor de renderização procura especificamente por estes dois marcadores para injetar as linhas da tabela:

```html
<table>
  <thead>...</thead>
  <tbody>
    <!-- ITEMS_START -->
    <!-- Este conteúdo será substituído dinamicamente pelas linhas (tr) geradas no JS -->
    <!-- ITEMS_END -->
  </tbody>
</table>
```

As linhas injetadas seguem este formato de colunas:
1. ID/Index
2. Descrição (Label)
3. Unidade
4. Quantidade
5. Preço Unitário
6. Total do Item

---

## 4. Estilização e Cores da Marca
A aplicação injeta cores personalizadas no `<head>` de cada modelo. Para que o design respeite as cores escolhidas pelo usuário, utilize as seguintes variáveis CSS:

```css
:root {
  --primary-color: #1A5276; /* Azul Marinho (Default) */
  --secondary-color: #E87722; /* Laranja (Default) */
}
```

Exemplo de uso no HTML:
`<h1 style="color: var(--primary-color);">Proposta Comercial</h1>`

---

## 5. Instruções para LLMs
- **NUNCA** altere a lógica de busca de placeholders.
- **NUNCA** remova os comentários de `IF_` ou `ITEMS_`.
- Ao criar um novo modelo, prefira usar CSS inline ou um bloco `<style>` dentro do `<head>` para garantir máxima compatibilidade com o gerador de PDF.
- O layout deve ser otimizado para formato **A4** (210mm x 297mm).
