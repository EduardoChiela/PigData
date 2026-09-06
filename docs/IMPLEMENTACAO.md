# Histórico de implementação

Registro cronológico das criações e alterações no código e na documentação.
Toda mudança relevante deve gerar uma entrada nova no topo da seção **Registros** (mais recente primeiro).

## Template de entrada

```markdown
### YYYY-MM-DD — Título curto
- **Contexto:** por que
- **Áreas:** lista dos arquivos em docs/ tocados
- **O que mudou:** arquivos/módulos de código
- **Como funciona agora:** 2–4 linhas
- **Status:** feito | em andamento | pendente de validação
```

## Registros

### 2026-09-06 — Login + painel do parceiro ACIT
- **Contexto:** Fluxo do proprietário (`painel-proprietario.md`); contas cliente e parceiro.
- **Áreas:** `usuarios-papeis.md`, `rascunhos/painel-proprietario.md`, `README.md`
- **O que mudou:** `/entrar` (login/cadastro mock); `/painel` (agenda, solicitações aceitar/recusar, anúncios); sessão com papéis.
- **Como funciona agora:** deslogado → apresentação; cliente → mapa; parceiro ACIT → painel (Agenda primeiro). Contas demo: Ana (cliente) e Marcos (parceiro).
- **Status:** feito (protótipo; cadastro de espaço ainda stub)

### 2026-09-06 — Pedido T04–T06: data, comodidades, revisão
- **Contexto:** Incorporar `fluxo-comodidades.md` a partir da Tela 1 do pedido.
- **Áreas:** `fluxo-telas.md`, `comodidades.md`, `rascunhos/fluxo-comodidades.md`
- **O que mudou:** `BookingRequestFlow` (basics → amenities com total → review → sent); painel fullscreen.
- **Como funciona agora:** após “Escolher data e solicitar”: calendário + visita + período/evento/convidados → checklist de comodidades com continha → revisão e envio mock.
- **Status:** feito (protótipo)

### 2026-09-06 — T04 parcial: calendário + agendar visita
- **Contexto:** Continuar o fluxo após “Escolher data e solicitar”; calendário do espaço e pergunta de visita (rascunho).
- **Áreas:** `fluxo-telas.md`, `agenda-calendario.md`, `rascunhos/agendar-visita.md`
- **O que mudou:** painel fullscreen; `SpaceAvailabilityCalendar`; `ScheduleVisitBlock` + `visit-request` (WhatsApp + registro mock tag Visita).
- **Como funciona agora:** CTA expande o modal; calendário mostra livre/parcial/ocupado; abaixo, pergunta de visita (Sim abre wa.me; Agora não segue). Período/evento ainda placeholder.
- **Status:** feito (protótipo parcial)

### 2026-09-06 — Marca Ágora, topbar e home no mapa
- **Contexto:** Logo/nome definitivos; mapa como home; landing só para visitante; favicon próprio.
- **Áreas:** `nomenclatura.md`, `fluxo-telas.md`, `mapa-busca.md`, `mvp.md`, `espacos.md`, `busca-locacao.md`, `README.md`
- **O que mudou:** assets `agora-logo`/`favicon.png`; topbar charcoal com perfil mock; `APP_NAME=Ágora`; `/` = mapa; `/bem-vindo` = landing; `/buscar` → `/`; sessão mock (`mock-session.ts`); fundo/paleta ink + acento ACIT.
- **Como funciona agora:** logado (padrão) abre o mapa; “Sair (mock)” mostra a apresentação; ícone do navegador usa a logo com fundo branco.
- **Status:** feito (protótipo; login real pendente)

### 2026-09-05 — Painel de detalhe do espaço (T03 na busca)
- **Contexto:** Ao selecionar um espaço na lista, exibir perfil completo estilo Airbnb sem fechar a listagem.
- **Áreas:** `espacos.md`, `fluxo-telas.md`, `mapa-busca.md`
- **O que mudou:** `SpaceDetailPanel`; galeria mock (`getSpaceGallery`); `/buscar` abre painel à direita da lista (~80% da área restante).
- **Como funciona agora:** clique no card ou pin abre o detalhe (galeria, infra, comodidades incluso/opcional, regras, preço); lista permanece aberta para trocar de espaço; CTA de pedido aguarda T04.
- **Status:** feito (protótipo)

### 2026-09-05 — Motion + search stacked
- **Contexto:** Expandida deve manter campo de texto em cima e detalhes embaixo; animar UI; filtros sem drop shadow.
- **Áreas:** `stack.md`, `fluxo-telas.md`
- **O que mudou:** dep `motion`; `SearchBar` layout stacked; animações na busca/lista/filtros; botão Filtros sem sombra.
- **Status:** feito

### 2026-09-05 — Busca: chip Material + lista branca mais larga
- **Contexto:** Minimizado deve ser só lupa + campo de texto, centralizado; fundos off-white incomodavam.
- **Áreas:** `fluxo-telas.md`
- **O que mudou:** chip de busca estilo Material (expandir ao focar); painel expandido com q/data/período; sidebar 26rem e fundo branco; filtro por texto livre no mock.
- **Status:** feito

### 2026-09-05 — Busca: UI limpa (busca colapsável, pins, tags)
- **Contexto:** Reduzir ruído sobre o mapa; melhorar contraste e leitura da lista; destacar diferenciais.
- **Áreas:** `fluxo-telas.md`, `mapa-busca.md`, `comodidades.md`
- **O que mudou:** busca colapsável; filtros limpos ao lado da lista; botões creme/âmbar de alto contraste; pins teardrop (ACIT verde claro, demais cinza); `AmenityTags` reutilizável nos cards.
- **Como funciona agora:** mapa permanece protagonista; cidade/data só na busca colapsável; comodidades aparecem como tags coloridas.
- **Status:** feito (protótipo)

### 2026-09-05 — Busca map-first (lista colapsável + filtros dropdown)
- **Contexto:** Layout em 3 colunas apertava o mapa; priorizar o mapa como superfície principal.
- **Áreas:** `fluxo-telas.md`, `mapa-busca.md`, `mvp.md`
- **O que mudou:** `/buscar` com mapa full-bleed; filtros em painel dropdown; lista lateral colapsável (`SpaceCard` compacto); footer oculto em `/buscar`.
- **Como funciona agora:** o mapa ocupa o viewport; busca/filtros flutuam no topo; a lista abre/fecha sem perder o contexto do mapa.
- **Status:** feito (protótipo)

### 2026-09-05 — Mapa oblíquo na busca (pins, sem prédios texturizados)
- **Contexto:** Implementar mapa na T02 com vista isométrica/oblíqua; sem recolorir malha fotorealística — só posição + pins dos espaços do site.
- **Áreas:** `mapa-busca.md`, `stack.md`, `mvp.md`, `fluxo-telas.md`, `busca-locacao.md`
- **O que mudou:** `src/components/spaces-map.tsx` (Google hybrid tilt 45° + AdvancedMarker; fallback mock); `/buscar` em split lista + mapa com sync de seleção.
- **Como funciona agora:** resultados filtrados aparecem como pins (ACIT maiores); clique no pin ou no card seleciona; sem chave Google usa mapa mock. Camada C e Photorealistic 3D ficam para depois.
- **Status:** feito (protótipo)

### 2026-09-05 — Reinício: landing + busca + mock Toledo
- **Contexto:** Código antigo apagado por desalinhamento com regras de negócio; reconstruir a partir de `docs/`, começando pela superfície de entrada.
- **Áreas:** `fluxo-telas.md`, `busca-locacao.md`, `espacos.md`, `comodidades.md`, `mvp.md`, `stack.md`, `README.md`
- **O que mudou:** `src/` recriado com home (T01), `/buscar` (T02), header/footer, barra de busca disponibilidade-first, e `mock-data.ts` com 22 espaços em Toledo - PR (ACIT, comodidades, agenda mock).
- **Como funciona agora:** cliente escolhe cidade/data/período na home → lista só disponíveis com ACIT primeiro; filtros ACIT/pets/capacidade/evento/classe. Sem solicitação/pagamento ainda.
- **Status:** feito (base); mapa e T03+ pendentes

### 2026-09-05 — Código do protótipo apagado
- **Contexto:** Pedido explícito de remover o código da UI (as milhares de linhas em `src/`).
- **Áreas:** `README.md`, `stack.md`, `mvp.md`, e seções “Estado da implementação” das áreas do produto
- **O que mudou:** pasta `src/` inteira removida (rotas, componentes, mock, mapa, estilos).
- **Como funciona agora:** o repositório fica só com documentação de produto. Não há `npm run dev` até recriar a UI a partir de `docs/`.
- **Status:** feito

### 2026-09-05 — Lixo duplicado removido
- **Contexto:** Ainda restava o rascunho antigo de busca (~1.000 linhas), config shadcn e boilerplate Lovable/Bun.
- **Áreas:** `IMPLEMENTACAO.md`
- **O que mudou:** apagados `docs/novas-funcionalidades-busca-locacao-pigdata.md`, `components.json`, `src/routes/README.md`, `roadmap.md`, `bunfig.toml`, `bun.lock`.
- **Como funciona agora:** busca/locação só em `docs/busca-locacao.md`; o app continua npm + as telas do protótipo.
- **Status:** feito

### 2026-09-05 — Remoção do kit shadcn não usado
- **Contexto:** O dump Lovable trazia dezenas de componentes UI e deps (sidebar, charts, menus…) que o protótipo não importa — milhares de linhas mortas.
- **Áreas:** `stack.md`
- **O que mudou:** apagados os `src/components/ui/*` não usados (fica `button` + `sonner`); CSS sem tokens de sidebar/chart/dark; saíram Radix/recharts/cmdk/etc. e o React Query sem fetch.
- **Como funciona agora:** as telas continuam iguais; o código do app é só rotas, mapa, mock e os dois primitivos de UI.
- **Status:** feito

### 2026-09-05 — UI Tagvenue + mapa 3D com relevo
- **Contexto:** Inspirar home/busca no Tagvenue (hero split, barra de busca, lista + mapa) sem copiar o fluxo deles; o mapa precisa de relevo 3D.
- **Áreas:** `mapa-busca.md`, `stack.md`, `mvp.md`, `fluxo-telas.md`
- **O que mudou:** `spaces-map.tsx` (Photorealistic 3D HYBRID + fallback híbrido inclinado); home hero + header; busca em split viewport; cards mais fotográficos.
- **Como funciona agora:** Entrada continua cidade + data/período; mapa tenta `gmp-map-3d` com pins no terreno (ACIT maior); se a API 3D falhar, usa satélite inclinado. Fluxo T01–T12 inalterado.
- **Status:** feito (protótipo)

### 2026-09-05 — Protótipo alinhado à documentação (sem o zip Lovable)
- **Contexto:** Ignorar o export `espaço-em-rede.zip` e construir o site a partir de `docs/` (fluxo T01–T12, busca/locação, comodidades, reservas, pagamento demo, cadastro assistido).
- **Áreas:** `mvp.md`, `fluxo-telas.md`, `reservas.md`, `busca-locacao.md`, `espacos.md`, `comodidades.md`, `mapa-busca.md`, `pagamento-demo.md`, `cadastro-assistido-google.md`, `agenda-calendario.md`, `parceiros-rede.md`, `usuarios-papeis.md`, `pagamentos-confianca.md`, `README.md`
- **O que mudou:** catálogo oficial de comodidades e perfis Toledo; filtros reais no mock; favoritos; solicitação com estados persistidos; painel aprova/recusa; checkout demo; cadastro mock Google/manual; camada C no mapa (toggle).
- **Como funciona agora:** cliente busca só disponíveis (ACIT primeiro), solicita sem pagar, espaço analisa, pagamento simulado confirma a reserva. Nome visível: Espaços ACIT (codinome do repo continua PigData).
- **Status:** feito (protótipo)

### 2026-09-05 — UI própria (Lovable só como inspiração visual)
- **Contexto:** Não usar o export Lovable como produto; reconstruir telas a partir de `docs/` (fluxo, reservas, busca).
- **Áreas:** rotas `src/routes/*`, header/card/footer; `stack.md`, `mvp.md`
- **O que mudou:** home/busca/detalhe/solicitação/acompanhamento/painéis reescritos; remoção de reporting Lovable; Maps mantido.
- **Como funciona agora:** produto alinhado ao wireframe de negócio; Lovable = cores/tipografia/referência de layout.
- **Status:** feito (protótipo)

### 2026-09-05 — Google Maps + alinhamento Lovable × docs
- **Contexto:** Integrar Maps com chave via `.env`; revisar telas Lovable vs fluxo documentado; Calendar secret só server-side.
- **Áreas:** `stack.md`, `IMPLEMENTACAO.md`; `src/components/spaces-map.tsx`; `buscar`, `reservar`, `espacos`, `mock-data`; `.env.example`
- **O que mudou:** mapa real (fallback mock); solicitação em 3 passos com comodidades/cotação; filtros ACIT/pets; favoritar; Toledo no mapa.
- **Como funciona agora:** `VITE_GOOGLE_MAPS_API_KEY` no `.env`; Calendar OAuth documentado mas não conectado.
- **Status:** feito (protótipo)

### 2026-09-05 — Base Lovable + stack TS + Toledo-PR
- **Contexto:** Começar programação com front mockado; integrar esqueleto Lovable; cidade piloto Toledo - PR.
- **Áreas:** `stack.md`, `mvp.md` (novos); `README.md`; app em `src/` (mock, home, busca)
- **O que mudou:** Vite/React/TanStack/Tailwind na raiz; mocks em Toledo; docs de stack/MVP.
- **Como funciona agora:** `npm run dev` sobe o protótipo visual; backend permanece mock.
- **Status:** feito (protótipo)

### 2026-09-05 — Wireframe / fluxo de telas (base)
- **Contexto:** Incorporar wireframe de fluxo do cliente (busca → solicitação → aprovação → pagamento → confirmação), marcado como base não definitiva.
- **Áreas:** `fluxo-telas.md` (novo), `reservas.md`, `visao-geral.md`, `usuarios-papeis.md`, `README.md`
- **O que mudou:** documentação de UX/produto; sem código de telas ainda.
- **Como funciona agora:** solicitação ≠ reserva; pagar após aprovação; fila de interesse por espaço+data+período; sem visitação.
- **Status:** feito (base; sujeito a validação)

### 2026-09-05 — Busca/locação e pagamento demo
- **Contexto:** Incorporar defs de favoritos, filtros (cidade, m², pets…), locação dia/hora, atributos do espaço, seguro e checkout simulado; esclarecer nomenclatura (PigData = codinome).
- **Áreas:** `busca-locacao.md`, `pagamento-demo.md`, `nomenclatura.md` (novos); `mapa-busca.md`, `agenda-calendario.md`, `espacos.md`, `reservas.md`, `pagamentos-confianca.md`, `usuarios-papeis.md`, `visao-geral.md`, `README.md`
- **O que mudou:** docs de produto; nomes estáveis sem sufixo “novas-funcionalidades-…-pigdata”; sem código ainda.
- **Como funciona agora:** busca rica documentada; pagamento demo isolado do real; seguro só demo até parceiro; README deixa claro que o nome do app mudará.
- **Status:** feito (decisão de produto)

### 2026-09-05 — Comodidades formalizadas (catálogo + carrinho)
- **Contexto:** Promover o rascunho de comodidades a documentação oficial e alinhar nomenclatura (só “comodidade”, sem add-on paralelo).
- **Áreas:** `comodidades.md` (novo), `espacos.md`, `reservas.md`, `mapa-busca.md`, `pagamentos-confianca.md`, `visao-geral.md`, `README.md`, `rascunhos/`
- **O que mudou:** doc oficial; rascunho removido (ponteiro em `rascunhos/README.md`); sem código ainda.
- **Como funciona agora:** catálogo único; espaço marca e precifica; pedido com cotação estilo carrinho; classes/tipos de evento só para busca; infra básica fora do catálogo.
- **Status:** feito (decisão de produto; catálogo ainda provisório para validar com ACIT)

### 2026-09-05 — Cadastro assistido com Google Places
- **Contexto:** Incorporar decisão de onboarding assistido (Places API New + Maps JS) à documentação do PigData.
- **Áreas:** `cadastro-assistido-google.md` (novo), `espacos.md`, `mapa-busca.md`, `agenda-calendario.md`, `visao-geral.md`, `usuarios-papeis.md`, `README.md`
- **O que mudou:** documentação de produto; sem código do fluxo ainda.
- **Como funciona agora:** dono escolhe Google ou manual → Place ID + revisão de dados públicos → completa locação no PigData; Places na busca (camada C) permanece uso separado; Calendar opcional e independente.
- **Status:** feito (decisão de produto)

### 2026-09-05 — Índice da documentação na raiz
- **Contexto:** O README do projeto fica na raiz; evitar duplicar índice dentro de `docs/`.
- **Áreas:** `README.md` (raiz), remoção de `docs/README.md`, regra `.cursor/rules/docs-antes-de-implementar.mdc`
- **O que mudou:** índice único na raiz com links para `docs/`; `docs/README.md` apagado.
- **Como funciona agora:** entrar pelo `README.md` da raiz; detalhes por módulo em `docs/`.
- **Status:** feito

### 2026-09-05 — Comodidades na busca, destaque ACIT e camada Google
- **Contexto:** Definir como comodidades entram na pesquisa e na monetização; como parceiros ACIT ganham destaque; e a viabilidade de exibir locais via Google Maps/Places com limitações.
- **Áreas:** `mapa-busca.md`, `espacos.md`, `pagamentos-confianca.md`, `parceiros-rede.md`, `visao-geral.md`, `README.md`
- **O que mudou:** documentação de produto (sem código de app); índice alinhado às decisões de busca/comodidades/ACIT/Google.
- **Como funciona agora:** busca = data + comodidades; mapa em camadas A/B/C (ACIT → cadastrado → Google limitado); add-ons com preço alimentam ticket e comissão futura.
- **Status:** feito (decisão de produto)

### 2026-09-05 — Estrutura inicial de documentação
- **Contexto:** Criar pasta `docs/` com histórico e arquivos por parte do sistema, para manter contexto entre sessões.
- **Áreas:** todos os documentos em `docs/`
- **O que mudou:** criação de `docs/README.md`, `docs/IMPLEMENTACAO.md` e documentos por módulo (ainda sem código de produto).
- **Como funciona agora:** documentação é a fonte de verdade do produto; implementações futuras devem ler e atualizar estes arquivos.
- **Status:** feito
