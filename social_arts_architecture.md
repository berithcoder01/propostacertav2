# 🎨 Impressão Digital da Aplicação - Gerador de Artes Sociais (Social Arts)

## 1. Visão Geral e Stack Tecnológica
- **Propósito:** Permitir que o prestador de serviço crie materiais de marketing profissionais (WhatsApp, Instagram, Stories) em segundos, sem sair da plataforma.
- **Tecnologia Principal:** React + Tailwind CSS (para layouts dos banners).
- **Processamento de Imagem:** `html2canvas` (Geração de PNG via Client-side - não consome recursos do servidor).
- **Animações:** Framer Motion (Transições entre modelos e feedback de download).

## 2. Padrões de Design e Código
- **Tematização Dinâmica:** As artes consomem automaticamente as cores (`primaryColor`, `secondaryColor`) e a logo do perfil da empresa configurada no `AuthContext`.
- **WYSIWYG (What You See Is What You Get):** O que o usuário edita nos inputs reflete instantaneamente no preview em alta fidelidade.
- **Escalabilidade de Modelos:** O sistema é baseado em "Presets" (configurações declarativas), facilitando a criação de novos layouts sem mexer na lógica de download.

## 3. Estrutura de Dados (Presets)
Os modelos são definidos no arquivo `src/features/growth/data/bannerPresets.js`. Cada objeto contém:
- `id`: Identificador único do template.
- `category`: Agrupamento (ex: "WhatsApp Status", "Instagram Feed").
- `sizes`: Dimensões suportadas (ex: `1080x1080`, `1080x1920`).
- `fields`: Lista de campos editáveis (labels, placeholders, limites de caracteres).
- `requiresPhoto`: Booleano que ativa o módulo de upload de foto local.

## 4. Estrutura de Pastas e Componentes
A lógica está centralizada em `src/features/growth/components/SocialArtsTab.jsx`:

- **`SocialArtsTab`**: Gerenciador de estado (seleção de modelo, valores dos campos, foto carregada).
- **`BannerRender`**: O "Coração" do sistema. Um componente que recebe o preset e os dados e renderiza o HTML/CSS que será transformado em imagem.
- **`FieldEditor`**: Gerador dinâmico de formulários baseado nos campos do preset.
- **`PhotoUploader`**: Lida com o upload via `FileReader` (as fotos ficam apenas no cache do navegador por privacidade e performance).

## 5. Lógica de Geração de Imagem (Download)
O processo de exportação ocorre na função `handleDownload`:
1. **Captura:** O DOM do preview é referenciado via `useRef`.
2. **Processamento:** O `html2canvas` tira um "print" do elemento.
    - Configuração `scale: 2`: Garante que a imagem final seja baixada em alta resolução (Retina/4K).
    - `useCORS: true`: Permite capturar a logo da empresa mesmo que esteja em um bucket externo.
3. **Conversão:** O canvas é convertido para `DataURL` (image/png).
4. **Trigger:** Um link invisível é criado e clicado automaticamente para iniciar o download no computador/celular do usuário.

## 6. Fluxo de Personalização
1. **Input:** Usuário seleciona um modelo ➔ `SocialArtsTab` reseta os campos para os valores padrão do preset.
2. **Edição:** Cada tecla digitada atualiza o estado local ➔ `BannerRender` re-renderiza o preview.
3. **Logo/Cores:** O sistema verifica se a empresa tem identidade visual; caso contrário, usa um fallback (inicial do nome sobre a cor secundária).
4. **Finalização:** Clique em "Baixar" ➔ O sistema processa o estilo do banner e entrega o arquivo `.png`.
