# SquareZone Card Forge

Você vai construir o SquareZone Card Generator — uma aplicação web profissional
para criar, gerenciar e imprimir cartas do jogo SquareZone.
Stack: React + TypeScript + Tailwind + Supabase + shadcn/ui.

═══════════════════════════════════════════════════════════════
1. CONTEXTO — O QUE É O SQUAREZONE
═══════════════════════════════════════════════════════════════

SquareZone é um jogo de tabuleiro/cartas em desenvolvimento. As cartas seguem o
tamanho padrão de TCG (63,5 × 88 mm). Existem 5 tipos de carta, cada um com
identidade visual própria, conforme o livreto oficial de regras:

| Tipo         | Cor tema           | Notas                         |
|--------------|--------------------|--------------------------------|
| Feitiço      | Azul profundo      | #2d5480                        |
| Zona Oculta  | Azul-marinho escuro| #1e3a5a                        |
| Evento       | Vermelho profundo  | #5a1e1e                        |
| Letra        | Verde escuro       | #2a3a30                        |
| Número       | Marrom escuro      | #3a2a1e                        |

Observação de regras: Letra e Número são as Cartas de Coordenadas — compradas
em par (1 Letra + 1 Número) para definir uma Zona no tabuleiro (ex.: Carta K +
Carta 7 → Zona K7). Não existem "Evento de Número", "Coordenada Letra" ou
"Coordenada Número" como tipos separados — são apenas Letra e Número.

═══════════════════════════════════════════════════════════════
2. VISÃO GERAL DA ARQUITETURA
═══════════════════════════════════════════════════════════════

Páginas / rotas:
  /                → Landing / dashboard: grid da biblioteca de cartas
  /editor          → Editor de carta (carta nova)
  /editor/:id      → Editor de carta (editar carta salva)
  /print           → Página de preparação de impressão
  /settings        → Preferências globais

Estado:
  - Dados das cartas ficam no Supabase (tabela: cards)
  - Imagens de arte ficam no Supabase Storage (bucket: card-art)
  - Versos de carta ficam no Supabase Storage (bucket: card-backs)
  - Sem autenticação na v1 (uso único ou acesso aberto)

═══════════════════════════════════════════════════════════════
3. SCHEMA DO SUPABASE
═══════════════════════════════════════════════════════════════

Tabela: cards
  id            uuid primary key default gen_random_uuid()
  created_at    timestamptz default now()
  updated_at    timestamptz default now()
  name          text not null
  card_type     text not null  -- 'feitico'|'zona'|'evento'|'letra'|'numero'
  subtype       text
  title         text
  title_align   text default 'left'   -- 'left'|'center'|'right'
  flavor_text   text
  effect_text   text
  cost_icon     integer default 0     -- 0=nenhum, 1=×1, 2=×2
  cost_number   text
  card_number   text
  rarity        text default 'none'   -- 'none'|'comum'|'incomum'|'raro'|'epico'|'lendario'
  base_color    text default '#9ec6e0'
  border_color  text default '#7aaac8'
  auto_border   boolean default true
  border_style  text default 'simple'
  texture1      text default 'fabric'
  texture1_int  integer default 30
  texture2      text default 'vignette'
  texture2_int  integer default 40
  title_font    text default 'Cinzel'
  body_font     text default 'EB Garamond'
  title_size    integer default 52
  art_fit       text default 'cover'   -- 'cover'|'contain'
  art_x         integer default 50
  art_y         integer default 50
  art_zoom      integer default 100
  art_url       text                   -- URL no Supabase Storage
  thumbnail_url text                   -- JPEG 200×280 gerado automaticamente
  back_url      text                   -- verso personalizado da carta (opcional, sobrepõe o verso padrão do tipo)
  neon_inner    boolean default false
  auto_text     boolean default true
  settings      jsonb                  -- campo genérico para futuros campos

═══════════════════════════════════════════════════════════════
4. EDITOR DE CARTA — LAYOUT
═══════════════════════════════════════════════════════════════

Layout dividido:
  PAINEL ESQUERDO (320px, com scroll)  — todos os controles, organizados em seções recolhíveis
  ÁREA DIREITA (flex-grow)             — preview do canvas ao vivo, centralizado, com controle de zoom

O canvas renderiza a carta internamente em 990×1320 px, exibida com escala
ajustada ao espaço disponível no painel direito. A exportação sempre usa os
990×1320 px completos.

Zonas do canvas (todos os valores em px, base 990×1320):
  Raio externo (OR): 36px
  Padding externo (OP): 18px, Padding interno (IP): 19px
  CX=37, CW=916   ← limites horizontais do conteúdo

  Barra de título:  y=37,  h=107
  Área de arte:     y=152, h=487
  Barra de flavor:  y=647, h=80
  Área de efeito:   y=735, h≈549
  (gap ZG=8 entre zonas, ZR=12 raio interno)

═══════════════════════════════════════════════════════════════
5. EDITOR DE CARTA — SEÇÕES DO PAINEL DE CONTROLE
═══════════════════════════════════════════════════════════════

Seção 1 — Tipo de Carta
  • Select: card_type (define preset de cor + imagem de verso)
  • Input: subtype (texto pequeno em itálico, abaixo da barra de título)

Seção 2 — Textos da Carta
  • Input: title (máx. 32 caracteres)
  • Botões toggle: title_align (esquerda | centro | direita)
  • Input: flavor_text (máx. 72 caracteres)
  • Textarea: effect_text

Seção 3 — Arte da Carta
  • Botão de upload + zona de arrastar-e-soltar + listener de colar (Ctrl+V)
  • Mostra o nome do arquivo quando carregado; botão "Remover arte"
  • Toggle: art_fit (Cobrir — preenche a área | Conter — imagem completa)
  • Slider: art_x  0–100 (posição horizontal, padrão 50)
  • Slider: art_y  0–100 (posição vertical, padrão 50)
  • Slider: art_zoom 50–250 (zoom %, padrão 100)
  • Texto placeholder quando vazio: "↑ Carregar imagem da arte / ou cole com Ctrl+V"

Seção 4 — Ícone de Custo
  • Toggle: cost_icon (Nenhum | ×1 | ×2)
  • Input: cost_number (texto curto exibido sobre o ícone, ex.: "1"–"9")

Seção 5 — Identificação
  • Input: card_number (ex.: "001/120")
  • Select: rarity com preview de bolinha colorida

Seção 6 — Tipografia
  • Select: title_font
      Cinzel (padrão) | Uncial Antiqua | Almendra | Metamorphous |
      Philosopher | Crimson Text | EB Garamond
  • Select: body_font (mesma lista, padrão EB Garamond)
  • Slider: title_size 5–80 (padrão 52), mostra valor em tempo real

Seção 7 — Sistema de Cores
  • Grid de amostras de cor (18 cores, 3 grupos):
      Aquático/Natural/Fogo: #9ec6e0, #2d5480, #38b2c0, #6da87a, #4a7c52, #b84830
      Arcano/Sombrio/Sagrado: #7248a8, #4a2870, #2a2a3a, #c8a030, #e8d890, #d4c8b0
      Terra/Metal/Neutro: #8c6040, #606858, #909898, #c0a860, #b0d0c0, #f0e8d8
  • Seletor de cor: base_color
  • Seletor de cor: border_color
  • Checkbox: auto_border (deriva a borda a partir da cor base)

Seção 8 — Textura e Efeito
  • Select: texture1
      nenhuma | tecido | pergaminho | grão | ruído | couro | pedra | metal | arcano
  • Slider: texture1_int 0–100 (padrão 30)
  • Select: texture2
      nenhum | vinheta | brilho | brilho interno | sombra interna | névoa | linhas | pontos
  • Slider: texture2_int 0–100 (padrão 40)

Seção 9 — Bordas
  • Select: border_style
      simples | dupla | tripla | grossa | neon | ornamentada | metálica
  • Checkbox: neon_inner (brilho interno sutil)

Seção 10 — Botões de ação
  • "Salvar carta" — upsert no Supabase, faz upload da arte se for nova
  • "Baixar PNG" — exporta o canvas em 990×1320
  • "↺ Restaurar padrão" — reseta todos os controles para o padrão

═══════════════════════════════════════════════════════════════
6. RENDERIZAÇÃO DO CANVAS (usar HTML5 Canvas via useRef + useEffect)
═══════════════════════════════════════════════════════════════

Ordem de renderização:
  1. Fundo da carta (retângulo arredondado, base_color)
  2. Borda externa (border_color, estilo de border_style)
  3. Zona da barra de título (retângulo arredondado, um pouco mais claro que a base)
  4. Zona da área de arte (clip + desenha a imagem com cover/contain + posição + zoom)
  5. Zona da barra de flavor
  6. Zona da área de efeito
  7. Texto do subtipo (itálico, pequeno, abaixo da barra de título)
  8. Texto do título (na barra de título, fonte/tamanho/alinhamento das configurações)
  9. Ícone(s) de custo na barra de flavor (lado esquerdo)
     - Usar o PNG do ícone de custo fornecido (símbolo de chama/carta laranja)
     - Processar pixels pretos para transparência via canvas offscreen
     - Mostrar cost_number como texto dourado em negrito sobre o primeiro ícone
  10. Texto de flavor (itálico, body_font, centralizado ou deslocado à esquerda quando há ícones)
  11. Texto de efeito (body_font, ajuste automático de tamanho para caber na área, alinhado à esquerda, com quebra de linha)
  12. Número da carta + raridade (texto pequeno, parte inferior da carta)
  13. Overlay de textura (texture1 desenhado em modo de mesclagem 'overlay' com alfa texture1_int*0.45)
  14. Efeito secundário (texture2: vinheta/brilho/névoa/etc.)

Cores de texto: derivadas automaticamente da luminosidade de base_color
(base escura → texto claro).

Lógica de cor automática do texto:
  L = luminosidade percebida de base_color (0–1)
  textHex = L > 0.5 ? '#1a1a2a' : '#f0eeea'
  textSoft = L > 0.5 ? 'rgba(20,20,40,0.6)' : 'rgba(230,220,200,0.65)'

Carregamento de fontes: usar document.fonts.ready antes do primeiro draw;
redesenhar ao trocar a fonte selecionada.

imageSmoothingQuality = 'high' sempre.

Transparência do ícone de custo: no primeiro carregamento, desenhar o ícone em
canvas offscreen, iterar pixels — qualquer pixel com brilho < 55 → alfa=0;
55–95 → fade proporcional. Guardar em cache o canvas processado. Nunca
reprocessar, a menos que o src do ícone mude.

═══════════════════════════════════════════════════════════════
7. BIBLIOTECA DE CARTAS (dashboard em /)
═══════════════════════════════════════════════════════════════

Grid de cartas agrupadas por card_type.
Cada carta mostra:
  - Imagem de thumbnail (thumbnail_url do Supabase Storage)
  - Nome da carta
  - Badge do tipo de carta
  - Indicador de raridade (bolinha)
  - Ações: Editar | Duplicar | Excluir | Exportar PNG | Adicionar à fila de impressão

Controles:
  - Busca por nome
  - Filtro por card_type
  - Filtro por raridade
  - Ordenar: mais novas | mais antigas | nome A–Z
  - Botão "Nova carta" → /editor

Estado vazio: mensagem amigável com CTA "Criar primeira carta".

═══════════════════════════════════════════════════════════════
8. PÁGINA DE IMPRESSÃO (/print)
═══════════════════════════════════════════════════════════════

Objetivo: preparar folhas A4 para impressão física em frente e verso (duplex)
e recorte.

Dimensões da carta: 63,5 × 88mm
Sangria (bleed): 3mm em cada lado → área impressa por carta = 69,5 × 94mm
Marcas de corte: 3mm além da sangria

Opções de layout:
  • 2×2 (4 cartas por folha) — padrão
  • 2×4 (8 cartas por folha)

Fluxo de trabalho:
  1. Usuário escolhe as cartas da biblioteca (ou repete a mesma carta várias vezes)
     - Arrastar cartas da biblioteca para os slots de impressão
     - Ou atalho "Adicionar carta atual"
  2. Preview: mostra a página de frente e a de verso lado a lado
  3. Layout da folha: A4 (210×297mm), cartas centralizadas, margens calculadas automaticamente
  4. Página de verso: cada verso de carta é espelhado horizontalmente por coluna
     (col 0 ↔ col 1) para o alinhamento correto na impressão duplex
  5. Botão de exportar: gera PDF usando jsPDF (ou canvas → window.print)
     com instruções embutidas: "Imprimir em duplex, virar pela borda longa"
  6. Marcas de corte renderizadas em ambas as páginas (linhas finas cinza)

Versos disponíveis por tipo:
  feitico    → verso brilhante verde   (imagem fornecida)
  zona       → verso brilhante azul    (imagem fornecida)
  evento     → verso brilhante vermelho (imagem fornecida)
  letra      → verso brilhante dourado (imagem fornecida)
  numero     → verso brilhante roxo    (imagem fornecida)
  personalizado → usuário pode escolher qualquer verso

Guardar os versos no Supabase Storage em /card-backs/ como JPEG.
Para tipos sem correspondência, usar um verso genérico escuro.

── Verso personalizado por slot + repetir carta ────────────────

Cada slot da fila de impressão deve permitir anexar um verso específico
para aquela carta naquele slot (upload de imagem), sobrepondo o verso
padrão do tipo. Isso é independente do back_url salvo na carta — é uma
sobreposição só para aquela sessão de impressão.

Botão "🔁 Repetir carta no próximo slot": ao lado de cada slot preenchido,
duplica a carta atual — incluindo o verso anexado, se houver — para o
próximo slot vazio da fila. Exemplo de uso: o usuário monta uma folha de
4 cartas, anexa um verso específico a uma delas e clica no botão para
replicar essa mesma carta (com o mesmo verso) no slot seguinte, sem
precisar arrastar e configurar tudo de novo.

Comportamento:
  - Se não houver slot vazio seguinte, o botão fica desabilitado.
  - A duplicação copia: card_id referenciado, verso anexado (se houver) e
    posição/rotação de impressão daquele slot.
  - O estado da fila de impressão (incluindo os versos anexados por slot)
    é local à sessão de impressão — não precisa ser persistido no Supabase.

═══════════════════════════════════════════════════════════════
9. FONTES
═══════════════════════════════════════════════════════════════

Carregar do Google Fonts:
  Cinzel:wght@400;600;700;900
  EB+Garamond:ital,wght@0,400;0,500;1,400
  Uncial+Antiqua
  Almendra:ital,wght@0,400;0,700;1,400
  Metamorphous
  Philosopher:ital,wght@0,400;0,700;1,400
  Crimson+Text:ital,wght@0,400;0,600;1,400
  DM+Sans:wght@300;400;500;600

═══════════════════════════════════════════════════════════════
10. SISTEMA DE DESIGN DA UI
═══════════════════════════════════════════════════════════════

Tema: escuro, profissional, clima de estúdio de jogos.

Cores:
  --bg:         #0b0e14
  --panel:      #12161f
  --panel2:     #181d28
  --border:     rgba(255,255,255,0.07)
  --border2:    rgba(255,255,255,0.13)
  --accent:     #5b8def
  --accent2:    #7c5dfa
  --text:       #e8eaf0
  --text2:      #9aa0b4
  --text3:      #5a6075
  --inp:        #1c2130
  --inpborder:  rgba(255,255,255,0.10)
  --radius:     8px

Tipografia:
  Rótulos de UI: DM Sans 11–12px
  Cabeçalhos de seção: DM Sans 9px, maiúsculas, letter-spacing 1.5px
  Preview do título da carta: Cinzel

Estilo dos componentes:
  - Painel esquerdo: 320px fixo, fundo escuro, scrollbar suave
  - Cabeçalhos de seção: maiúsculas, pequenos, cor var(--text3), borda inferior
  - Controles: largura total, padding consistente
  - Sliders: thumb na cor de destaque, trilho com gradiente
  - Grupos de botões toggle: formato pílula, estado selecionado com fundo de destaque
  - Amostras de cor: círculos de 20px, selecionado com anel branco
  - Área de preview: fundo cinza-escuro, carta centralizada com sombra sutil
  - Controle de zoom do preview: botões +/- ou slider (zoom apenas visual, não afeta a exportação)

Microinterações:
  - Seções do painel recolhíveis (chevron para expandir/recolher)
  - Estados de hover em todos os elementos interativos
  - Botão salvar mostra spinner de carregamento e depois um check
  - Indicador de alterações não salvas (ponto no botão "Salvar")

═══════════════════════════════════════════════════════════════
11. ESTRUTURA DE COMPONENTES REACT
═══════════════════════════════════════════════════════════════

src/
  pages/
    Index.tsx          ← Dashboard da biblioteca
    Editor.tsx         ← Editor de carta (envolve o CardEditorLayout)
    Print.tsx          ← Preparação de impressão
    Settings.tsx
  components/
    card-editor/
      CardEditorLayout.tsx    ← divide painel + canvas
      CardCanvas.tsx          ← ref do canvas, draw(), export
      ControlPanel.tsx        ← todas as seções
      sections/
        CardTypeSection.tsx
        TextSection.tsx
        ArtSection.tsx
        CostSection.tsx
        IdentitySection.tsx
        TypographySection.tsx
        ColorSection.tsx
        TextureSection.tsx
        BorderSection.tsx
        ActionsSection.tsx
    library/
      CardGrid.tsx
      CardThumbnail.tsx
      LibraryFilters.tsx
    print/
      PrintSlots.tsx
      PrintPreview.tsx
      PrintSlotBackUpload.tsx   ← upload/anexação de verso por slot
    ui/                ← componentes shadcn
  hooks/
    useCardEditor.ts   ← todo o estado da carta + trigger de draw
    useArtUpload.ts    ← lida com file/paste/drop → Supabase Storage
    useCardLibrary.ts  ← CRUD no Supabase
    usePrint.ts        ← lógica de layout de impressão + fila (incluindo versos por slot e "repetir no próximo slot")
  lib/
    canvas/
      drawCard.ts      ← função de desenho principal (pura, recebe CardState)
      drawZones.ts     ← helpers de zona (rr, zone, etc.)
      drawTextures.ts  ← geradores de textura
      drawEffects.ts   ← vinheta, névoa, brilho, etc.
      drawBorders.ts   ← estilos de borda
      costIcon.ts      ← processador + cache de transparência do ícone de custo
    supabase.ts        ← cliente
    cardTypes.ts       ← objeto de configuração CARD_TYPES
    rarityConfig.ts    ← símbolos e cores de raridade
    colorUtils.ts      ← helpers HSL, cor de texto automática
    printLayout.ts     ← cálculos de layout A4, sangria, marcas de corte
  types/
    card.ts            ← interface CardState correspondente ao schema do Supabase

═══════════════════════════════════════════════════════════════
12. ESTRUTURA DO SUPABASE STORAGE
═══════════════════════════════════════════════════════════════

Buckets:
  card-art/
    {card_id}/original.{ext}   ← imagem original enviada
    {card_id}/thumb.jpg        ← thumbnail JPEG 200×280

  card-backs/
    feitico.jpg
    zona.jpg
    evento.jpg
    letra.jpg
    numero.jpg
    generic.jpg

Políticas de RLS: leitura pública, escrita autenticada (ou aberta na v1).

═══════════════════════════════════════════════════════════════
13. O QUE NÃO CONSTRUIR NA V1
═══════════════════════════════════════════════════════════════

- Autenticação de usuário / múltiplos usuários
- Coleções de cartas / decks / conjuntos
- Colaboração em tempo real
- Marketplace ou URLs de compartilhamento
- Layout mobile-first (editor desktop está ok)
- Histórico de desfazer/refazer (futuro)
- Sistema de camadas complexo

═══════════════════════════════════════════════════════════════
14. COMECE AQUI — PRIMEIRAS TELAS A CONSTRUIR
═══════════════════════════════════════════════════════════════

Ordem de prioridade:
  1. Schema do Supabase (rodar o SQL acima)
  2. CardCanvas.tsx com draw() funcionando — barra de título, área de arte, barra de flavor, área de efeito, borda
  3. CardEditorLayout.tsx + seções básicas do ControlPanel (tipo, texto, cor)
  4. Upload de arte (arquivo + Ctrl+V + drag-and-drop) → Supabase Storage → canvas
  5. Salvar no Supabase + geração de thumbnail
  6. Dashboard da biblioteca com grid de cartas
  7. Texturas + efeitos + bordas
  8. Página de impressão (incluindo verso por slot + "repetir no próximo slot")

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://squarezone-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ce99305-b9b7-49e2-90d3-b4eddda8fed2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
