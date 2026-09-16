# Planejamento de Implementação — Explorar espaços, atividades, busca e mapa

> **Status:** em implementação no protótipo (2026-09-14)  
> Origem: Downloads · arquivo no repo: `docs/rascunhos/planejamento-explorar-busca-mapa.md`

## Status

**Proposta de planejamento — núcleo A–C em andamento no código.**

Projeto: **Ágora**  
Repositório/codinome: **PigData**  
Data da revisão: **2026-09-14**

Este planejamento foi elaborado após revisar o snapshot mais recente enviado do repositório, incluindo `README.md`, documentação oficial em `docs/`, rascunhos de planejamento e o estado atual dos componentes de busca, mapa, cadastro e reservas.

A referência de UX analisada é o **Peerspace**, principalmente:

- menu **Browse Spaces**;
- navegação por **Activities**, **Space Types** e **Amenities**;
- página **All Activities**;
- seção da home com atividades;
- busca com atividade, localização e data/horário;
- resultados com listagem + mapa;
- mapa interativo que acompanha a área visível.

A proposta é **adaptar os padrões de interação**, sem copiar identidade visual ou estrutura de marca do Peerspace.

---

# 1. Objetivo

Evoluir a experiência de descoberta da Ágora para que o cliente consiga:

1. explorar espaços por **atividade**;
2. explorar por **tipo de espaço**;
3. explorar por **comodidades**;
4. acessar uma página com **todas as atividades**;
5. descobrir atividades diretamente pela página inicial;
6. pesquisar por **data e horário exatos**;
7. visualizar uma listagem maior ao lado de um mapa;
8. identificar rapidamente o preço de cada local diretamente no mapa;
9. mover ou dar zoom no mapa e ver a lista ser atualizada conforme a área visível;
10. manter tudo integrado às regras de disponibilidade, reserva, ACIT e locação por hora já documentadas.

---

# 2. Estado atual encontrado no repositório

## 2.1 O que já existe

A base necessária para esta evolução já está parcialmente pronta.

### Marca

O nome comercial já está formalizado como:

```text
Ágora
```

O repositório continua com o codinome:

```text
PigData
```

### Mapa

Já existe:

```text
Google Maps JavaScript API
@vis.gl/react-google-maps
AdvancedMarker
```

Com fallback para mapa mock quando não existe API Key.

Arquivo principal:

```text
src/components/spaces-map.tsx
```

### Busca

Já existe uma barra de busca com:

```text
texto livre
cidade fixa em Toledo
data
período
```

Arquivo:

```text
src/components/search-bar.tsx
```

### Resultados

Já existe:

```text
mapa full-bleed
+
lista flutuante à esquerda
```

A lista desktop atual possui aproximadamente:

```text
26rem
```

e o mapa ocupa o fundo inteiro.

Arquivo:

```text
src/components/map-search-page.tsx
```

### Classificação dos espaços

Já existem três conceitos que podem ser reaproveitados:

```text
eventTypes      → atividades
spaceClasses    → tipos de espaço
amenityCatalog  → comodidades
```

Portanto, **não deve ser criada uma segunda taxonomia paralela** só para reproduzir o Browse Spaces do Peerspace.

### Locação por horário

O cadastro já possui:

```text
allowsFullDay
allowsHourly
hourlyPrice
```

Porém a busca e o motor de reserva ainda trabalham principalmente com períodos fixos:

```text
manhã
tarde
noite
dia inteiro
```

### Reservas

O pacote E1–E5 já foi implementado no mock:

- múltiplas solicitações;
- conflito/fila;
- aprovação manual e automática;
- hold de pagamento;
- calendário do parceiro;
- notificações;
- `/minhas-reservas`.

O novo filtro por horário deve **reaproveitar esse motor**, e não criar uma segunda lógica de disponibilidade.

---

# 3. Pontos importantes encontrados antes da implementação

## 3.1 Busca ainda ignora a cidade da URL

Atualmente `MapSearchPage` chama a busca aproximadamente como:

```text
city: "Toledo"
```

mesmo existindo:

```text
search.cidade
```

Isso precisa ser corrigido antes de a busca por outras cidades funcionar de verdade.

---

## 3.2 Campo cidade da barra ainda é fixo

Hoje a barra exibe:

```text
Toledo - PR
```

como campo somente leitura.

Para suportar o fluxo desejado, ele deve virar um seletor/autocomplete de cidade.

---

## 3.3 Cadastro possui dados que não são persistidos no listing publicado

`SpaceRegistrationDraft` já possui vários campos:

```text
rentalAreaM2
allowsFullDay
allowsHourly
allowsPets
hourlyPrice
amenities
janelas
tomadas
```

Porém `PublishedSpaceListing` persiste somente parte desses dados.

Além disso, `verifiedListingAsSpace()` atualmente preenche alguns campos com valores fixos, por exemplo:

```text
rentalAreaM2 = 120
allowsHourlyRental = false
allowsPets = false
amenities = []
```

Isso causará resultados incorretos em:

- filtro por atividade;
- comodidades;
- área;
- pets;
- aluguel por hora;
- preço/hora.

**Antes de ampliar a busca, o listing publicado precisa preservar os dados reais do cadastro.**

---

## 3.4 Reservas ainda usam `date + period`

O modelo mock atual trabalha com:

```text
date
period
```

e converte:

```text
manhã  → 08:00–12:00
tarde  → 13:00–18:00
noite  → 18:00–23:00
```

Para permitir busca realmente horária:

```text
18:30 → 22:00
```

a reserva precisa evoluir para intervalos de tempo reais.

---

# 4. Princípios que devem continuar valendo

As mudanças não devem quebrar os princípios já documentados.

## 4.1 Disponibilidade-first

A Ágora continua priorizando:

```text
Quando você precisa?
        ↓
Quais espaços estão disponíveis?
```

O Browse Spaces facilita descoberta, mas não substitui a disponibilidade como diferencial principal.

---

## 4.2 ACIT continua relevante

Espaços verificados continuam com:

- selo;
- prioridade comercial;
- destaque nos cards;
- prioridade nas alternativas.

O novo marcador de preço não deve apagar a informação de verificação ACIT.

---

## 4.3 Solicitação continua diferente de reserva

```text
Solicitação
≠
Reserva confirmada
```

A nova busca não altera a máquina de estados E1–E5.

---

## 4.4 Google externo continua limitado

Pins de locais vindos do Places não podem fingir que possuem:

- preço de locação;
- agenda;
- disponibilidade;
- reserva.

Marcadores de preço são apenas para espaços cadastrados na Ágora.

---

# 5. Taxonomia de descoberta

## 5.1 Atividades

Na UI, o conceito deve aparecer como:

```text
Atividades
```

Na primeira implementação, utilizar o catálogo já existente de `eventTypes`.

Exemplos atuais:

```text
Formatura
Casamento
Corporativo
Confraternização
Feira
Show
Aniversário
```

### Regra

Não criar simultaneamente:

```text
eventTypes
activityTypes
activities
```

como três fontes diferentes.

A primeira versão deve tratar:

```text
Atividade na UI
=
Tipo de evento no modelo atual
```

Se futuramente a Ágora atender produções, reuniões, ensaios etc., a taxonomia poderá ser ampliada de forma formal.

---

## 5.2 Tipos de espaço

Reaproveitar:

```text
spaceClasses
```

Exemplos atuais:

```text
Salão de festas
Coworking
Espaço corporativo
Área externa / Chácara
Espaço para casamento
```

Na UI:

```text
Tipos de espaço
```

---

## 5.3 Comodidades

Reaproveitar:

```text
amenityCatalog
```

Não misturar com infraestrutura básica.

Exemplo:

```text
comodidade:
Gerador silencioso

infraestrutura:
janelas
tomadas
ar-condicionado
estacionamento
```

Pets continua sendo filtro próprio.

---

# 6. Catálogo de descoberta

## Novo arquivo recomendado

```text
src/lib/discovery-catalog.ts
```

Objetivo:

Centralizar metadados visuais usados no menu e nas páginas de descoberta.

Exemplo conceitual:

```ts
type DiscoveryItem = {
  id: string
  label: string
  slug: string
  group?: string
  featured?: boolean
  image?: string
  description?: string
}
```

Catálogos:

```text
activities
spaceTypes
amenities
```

Os IDs continuam relacionados aos catálogos oficiais do produto.

Esse arquivo deve guardar **metadados de navegação**, não duplicar as regras dos espaços.

---

# 7. Menu "Explorar espaços"

## Objetivo

Adicionar à navegação superior um fluxo semelhante conceitualmente ao Browse Spaces.

Nome recomendado na Ágora:

```text
Explorar espaços
```

---

## 7.1 Desktop

Ao passar/clicar:

```text
Explorar espaços
       ▼

┌─────────────────────────────────────────────────────┐
│ ATIVIDADES       TIPOS DE ESPAÇO      COMODIDADES  │
│                                                     │
│ Aniversário      Salão de festas      Gerador       │
│ Casamento        Coworking             Coffee break │
│ Corporativo      Área externa          Streaming    │
│ Formatura        ...                   ...          │
│                                                     │
│ Ver todas as atividades                            │
└─────────────────────────────────────────────────────┘
```

### Comportamento

Clicar em uma atividade:

```text
/?
evento=Aniversário
```

Clicar em um tipo:

```text
/?
classe=Salão de festas
```

Clicar em uma comodidade:

```text
/?
comodidades=gerador
```

---

## 7.2 Mobile

Não usar mega-menu horizontal.

Utilizar:

```text
Explorar espaços
  ├─ Atividades
  ├─ Tipos de espaço
  └─ Comodidades
```

com accordion ou telas simples.

---

## Arquivos

Novo:

```text
src/components/browse-spaces-menu.tsx
```

Alterar:

```text
src/components/site-header.tsx
```

---

# 8. Página "Todas as atividades"

## Nova rota

```text
/atividades
```

Arquivo sugerido:

```text
src/routes/atividades.tsx
```

---

## 8.1 Estrutura

```text
Todas as atividades

[ Buscar uma atividade... ]

CELEBRAÇÕES
Aniversário
Casamento
Formatura
Confraternização

NEGÓCIOS
Corporativo
Feira

ENTRETENIMENTO
Show
```

Os grupos são metadados de apresentação.

A lista inicial deve respeitar o catálogo já documentado.

---

## 8.2 Clique

Ao clicar:

```text
Aniversário
```

navegar para:

```text
/?evento=Aniversário
```

e abrir a busca já filtrada.

---

## 8.3 Evolução futura

Quando houver mais atividades:

- busca textual;
- imagens;
- atividades em destaque;
- categorias;
- popularidade;
- SEO por atividade.

---

# 9. Nova seção na página inicial

## Objetivo

Adicionar uma seção inspirada no conceito:

```text
um espaço para cada momento
```

sem copiar layout ou texto do Peerspace.

---

## Local recomendado

Fluxo:

```text
Hero
↓
Busca principal
↓
Seção de atividades
↓
Como funciona
↓
Espaços disponíveis
```

---

## Estrutura sugerida

Desktop:

```text
┌───────────────────────────────────┬───────────────────┐
│ Um espaço para cada momento       │                   │
│                                   │      FOTO         │
│ Aniversário   Casamento           │                   │
│ Formatura     Corporativo         │                   │
│ Show          Feira               │                   │
│ Confraternização                  │                   │
│                                   │                   │
│ [ Ver todas as atividades ]       │                   │
└───────────────────────────────────┴───────────────────┘
```

Mobile:

```text
Título
Atividades em chips/lista
Ver todas
Imagem
```

---

## Novo componente

```text
src/components/activity-discovery-section.tsx
```

Alterar:

```text
src/routes/bem-vindo.tsx
```

---

# 10. Evolução da barra de pesquisa

## Situação atual

Hoje:

```text
Buscar texto
Onde
Data
Período
```

---

## Objetivo

Evoluir para:

```text
Atividade
Onde
Quando
Horário
Buscar
```

sem perder filtros avançados.

---

# 11. Campo Atividade

## UX

Autocomplete a partir do catálogo:

```text
O que você está planejando?

[ Aniversário             ]

Sugestões:
Aniversário
Casamento
Confraternização
...
```

Selecionar uma atividade atualiza:

```text
evento
```

no search param atual.

Isso evita quebrar imediatamente o modelo `EventType`.

---

# 12. Campo Cidade

Hoje é somente leitura.

Deve evoluir para:

```text
Onde?

[ Toledo - PR ▼ ]
```

Primeira fase:

- Toledo;
- outras cidades que possuírem dados mock/reais.

Não mostrar cidades sem resultados como se possuíssem oferta.

---

# 13. Campo "Quando"

O usuário já solicitou anteriormente duas modalidades.

## 13.1 Dia / período

```text
Data inicial
Data final
```

Exemplo:

```text
15/10/2026 → 17/10/2026
```

---

## 13.2 Por horário

```text
Data
Horário inicial
Horário final
```

Exemplo:

```text
15/10/2026
18:30 → 23:00
```

---

## 13.3 Popover recomendado

```text
Quando?

(•) Dia / período
( ) Por horário

Data inicial [        ]
Data final   [        ]
```

ou:

```text
Por horário

Data         [        ]
Início       [ 18:30 ]
Fim          [ 23:00 ]
```

---

# 14. Regras do horário

Quando o usuário selecionar:

```text
Por horário
```

somente espaços com:

```text
allowsHourlyRental = true
```

podem aparecer.

Também validar:

```text
minimumHourlyDuration
availableStartTime
availableEndTime
```

quando esses campos forem adicionados ao cadastro.

---

# 15. Cadastro do proprietário — complemento necessário

O cadastro já permite escolher:

```text
Dia / período
Por horário
```

e preço/hora.

Faltam campos para definir a janela operacional.

Adicionar quando `allowsHourly = true`:

```text
Horário inicial permitido
Horário final permitido
Duração mínima
```

Exemplo:

```text
08:00
23:00
2 horas
```

---

# 16. Migração do modelo de tempo

Este é um dos pontos mais importantes do planejamento.

## Atual

```ts
date
period
```

## Desejado

```ts
rentalMode
startsAt
endsAt
```

Exemplo:

```text
rentalMode = hourly
startsAt = 2026-10-15T18:30:00
endsAt   = 2026-10-15T23:00:00
```

Para diária:

```text
rentalMode = full_day
startsAt = 2026-10-15T00:00:00
endsAt   = 2026-10-18T00:00:00
```

Usar fim exclusivo.

---

## 16.1 Compatibilidade durante migração

Para não quebrar imediatamente o mock atual:

```text
date + period
        ↓
adapter
        ↓
startsAt + endsAt
```

Depois que todos os fluxos estiverem migrados, o legado pode ser removido.

---

## 16.2 Conflito

A mesma regra E1 continua válida:

```text
startA < endB
AND
endA > startB
```

Agora passa a funcionar com qualquer horário, não apenas manhã/tarde/noite.

---

# 17. Search params

## Atual

```text
cidade
data
periodo
q
acit
pets
capacidade
evento
classe
slug
```

## Proposta

Adicionar:

```text
modalidade
dataInicio
dataFim
horaInicio
horaFim
comodidades
areaMin
areaMax
precoMax
```

Manter temporariamente:

```text
data
periodo
```

para compatibilidade de links antigos.

---

# 18. Tela de resultados — novo layout desktop

## Situação atual

```text
mapa full-screen
+
lista pequena flutuando sobre ele
```

## Novo objetivo

Dar mais protagonismo aos locais.

Desktop:

```text
┌──────────────────────────────────────────────────────────────┐
│ Busca / filtros                                             │
├────────────────────────────────┬─────────────────────────────┤
│                                │                             │
│ RESULTADOS                     │            MAPA             │
│ ~60%                           │            ~40%             │
│                                │                             │
│ cards                          │                             │
│ cards                          │                             │
│ cards                          │                             │
│                                │                             │
└────────────────────────────────┴─────────────────────────────┘
```

---

## 18.1 Proporção sugerida

Em telas grandes:

```text
lista: 58–62%
mapa: 38–42%
```

O mapa deve manter largura mínima suficiente para interação.

---

## 18.2 Lista

Com a área maior, permitir:

```text
2 colunas de cards
```

quando houver largura suficiente.

Em notebook menor:

```text
1 coluna
```

---

## 18.3 Mapa

Fica:

```text
sticky / fixo dentro da viewport
```

enquanto a lista rola.

O usuário consegue comparar cards sem perder a região do mapa.

---

## 18.4 Mobile

Não tentar manter split-screen apertado.

Usar:

```text
[ Lista ] [ Mapa ]
```

ou botão flutuante para alternar.

---

# 19. Detalhe do espaço com o novo layout

Hoje o detalhe abre sobre o mapa enquanto a lista permanece.

Com o split novo, evitar deixar a tela excessivamente apertada.

Opções recomendadas:

### Desktop

```text
lista
→ clicar card
→ painel de detalhe amplo sobre a área de resultados
```

mantendo acesso fácil ao mapa.

### Mobile

```text
bottom sheet / tela cheia
```

Não mudar o fluxo de pedido T04–T06.

---

# 20. Marcadores de preço

## Objetivo

Trocar o marcador principal de busca por um marcador de preço.

Exemplo:

```text
┌────────────┐
│ R$ 1.800   │
└─────▼──────┘
```

Por horário:

```text
┌────────────┐
│ R$ 120/h   │
└─────▼──────┘
```

---

## 20.1 Lógica do preço

Se a busca for:

```text
modalidade = hourly
```

mostrar:

```text
hourlyPrice
```

Se for diária/período:

```text
basePrice
```

A unidade deve ser clara no card/detalhe.

---

## 20.2 ACIT

Como o preço ocupará o centro do marcador, o selo ACIT pode ser representado por:

- pequena borda;
- ícone de verificação;
- badge no canto;
- prioridade de z-index.

Não depender somente da cor do pin.

---

## 20.3 Coordenação com o backlog M4

Existe no backlog da equipe um item de Matheus:

```text
M4 — Marcadores na mesma cor; avaliações por estrela
```

Esta implementação deve ser coordenada com M4.

Uma solução compatível:

```text
todos os price markers usam a mesma base visual
+
ACIT aparece como pequeno selo
```

Isso evita implementar duas decisões conflitantes.

---

## Novo componente recomendado

```text
SpacePriceMarker
```

dentro de:

```text
src/components/spaces-map.tsx
```

ou em arquivo próprio.

---

# 21. Sincronização card ↔ marcador

## Hover no card

```text
card hover
    ↓
pin correspondente destaca
```

## Hover/click no marcador

```text
marcador
    ↓
card destaca
    ↓
lista rola até o card
```

Estados:

```text
selectedSlug
hoveredSlug
```

Usar estado separado para não confundir seleção permanente com hover.

---

# 22. Resultados atualizados ao mover o mapa

## Objetivo

Quando o usuário:

- arrasta;
- aproxima;
- afasta;

a lista deve refletir os espaços dentro da região visível.

---

## 22.1 Não atualizar em cada frame

Não recalcular/fazer chamada durante cada pixel de movimento.

Fluxo:

```text
usuário move mapa
        ↓
mapa termina movimento
        ↓
idle
        ↓
debounce ~300ms
        ↓
atualizar bounds
        ↓
atualizar resultados
```

---

## 22.2 Bounds

O mapa fornece:

```text
north
south
east
west
zoom
```

Filtrar:

```text
lat <= north
lat >= south
lng <= east
lng >= west
```

---

## 22.3 Estado da busca

Separar:

```text
allFilteredResults
```

de:

```text
visibleResults
```

### `allFilteredResults`

Passou por:

- atividade;
- cidade;
- data/horário;
- capacidade;
- preço;
- comodidades;
- etc.

### `visibleResults`

Além disso:

```text
está dentro do viewport do mapa
```

A lista exibe `visibleResults`.

---

# 23. Experiência ao mover o mapa

Exemplo:

```text
12 espaços nesta área
```

Usuário dá zoom:

```text
5 espaços nesta área
```

A lista muda junto.

---

## Controle recomendado

Pode existir uma opção:

```text
☑ Atualizar resultados ao mover o mapa
```

Para a primeira versão, deixar ativada por padrão.

---

# 24. Backend futuro

Hoje o filtro pode ser local porque os dados são mock.

Com backend:

```text
GET /spaces/search
```

enviando:

```text
city
activity
date/time
north
south
east
west
filters
```

No banco real, criar índice geográfico ou estratégia equivalente.

Não carregar milhares de espaços no frontend para depois filtrar.

---

# 25. Manter o mapa oblíquo

A documentação atual define:

```text
tilt ~45°
heading
mapa vetorial
```

Não remover essa decisão automaticamente.

Primeiro implementar os price markers no mapa atual.

Se os testes mostrarem que:

```text
price markers + tilt
```

prejudicam leitura, abrir decisão de produto separada para usar mapa plano na tela de busca.

---

# 26. Filtros rápidos na tela de resultados

Além do botão geral "Filtros", criar chips rápidos.

Exemplo:

```text
[ Atividade ]
[ Tipo de espaço ]
[ Preço ]
[ Pessoas ]
[ Área ]
[ Comodidades ]
[ Pets ]
[ Verificados ACIT ]
[ Mais filtros ]
```

Isso aproxima a experiência do padrão pesquisado sem copiar a interface.

---

# 27. Comodidades na busca

Adicionar search param que aceite múltiplas comodidades.

Exemplo:

```text
comodidades=gerador,wifi-dedicado
```

Regra padrão recomendada:

```text
AND
```

Ou seja:

se o usuário marcar:

```text
Gerador
Wi-Fi
```

o espaço precisa possuir ambos.

A UI deve deixar essa regra clara.

---

# 28. Persistência dos dados de cadastro

Antes de ativar todos os filtros, ampliar:

```text
PublishedSpaceListing
```

para preservar:

```text
city
state
rentalAreaM2
hourlyPrice
allowsFullDayRental
allowsHourlyRental
hourlyRentalStartTime
hourlyRentalEndTime
minimumHourlyDurationMinutes
hasWindows
windowCount
outlets
allowsPets
amenities
infra
```

Depois:

```text
verifiedListingAsSpace()
```

deve usar dados reais, e não valores hardcoded.

---

# 29. Componentes novos sugeridos

```text
src/components/browse-spaces-menu.tsx
src/components/activity-discovery-section.tsx
src/components/activity-picker.tsx
src/components/search-when-picker.tsx
src/components/search-filter-bar.tsx
src/components/space-price-marker.tsx
```

Nova rota:

```text
src/routes/atividades.tsx
```

Novo catálogo:

```text
src/lib/discovery-catalog.ts
```

---

# 30. Arquivos existentes afetados

## Navegação

```text
src/components/site-header.tsx
```

## Landing

```text
src/routes/bem-vindo.tsx
```

## Busca

```text
src/components/search-bar.tsx
src/components/map-search-page.tsx
src/lib/search-params.ts
src/lib/mock-data.ts
```

## Mapa

```text
src/components/spaces-map.tsx
```

## Cards

```text
src/components/space-card.tsx
```

## Horário e disponibilidade

```text
src/lib/reservations.ts
src/components/booking-request-flow.tsx
src/components/space-availability-calendar.tsx
```

## Cadastro

```text
src/components/space-registration-wizard.tsx
src/lib/space-registration.ts
```

Possíveis ajustes:

```text
src/components/space-detail-panel.tsx
src/components/owner-agenda.tsx
```

---

# 31. Ordem recomendada de implementação

## Fase 0 — Preparar dados

Antes da UI nova:

1. expandir `PublishedSpaceListing`;
2. remover hardcodes de `verifiedListingAsSpace`;
3. centralizar catálogo de descoberta;
4. preparar search params;
5. adicionar campos de horário permitido no cadastro.

**Motivo:** filtros não podem depender de dados falsos.

---

## Fase 1 — Explorar espaços

Implementar:

```text
Explorar espaços
├─ Atividades
├─ Tipos
└─ Comodidades
```

Criar:

```text
discovery-catalog.ts
browse-spaces-menu.tsx
```

---

## Fase 2 — Todas as atividades + home

Criar:

```text
/atividades
```

Adicionar:

```text
ActivityDiscoverySection
```

na landing.

Validar links:

```text
atividade → resultados filtrados
```

---

## Fase 3 — Busca por data e hora

1. novo picker de quando;
2. modalidade dia/hora;
3. search params;
4. `startsAt` / `endsAt`;
5. adaptação do motor E1–E5;
6. filtros de disponibilidade;
7. booking request compatível.

Essa fase deve ser concluída antes de considerar a busca horária pronta.

---

## Fase 4 — Novo layout da busca

Alterar:

```text
map full-bleed + sidebar
```

para:

```text
lista ampla | mapa à direita
```

Desktop primeiro.

Depois validar responsividade.

---

## Fase 5 — Marcadores de preço

1. criar price marker;
2. selecionar preço correto por modalidade;
3. sincronizar selected/hover;
4. manter identificação ACIT;
5. alinhar com M4.

---

## Fase 6 — Busca pela área do mapa

1. capturar bounds;
2. atualizar em `idle`;
3. debounce;
4. filtrar lista;
5. sincronizar contagem;
6. tratar selected space;
7. preparar contrato do backend futuro.

---

## Fase 7 — Filtros rápidos

Adicionar chips de:

```text
Atividade
Tipo
Preço
Pessoas
Área
Comodidades
Pets
ACIT
```

Manter modal "Mais filtros" para opções menos usadas.

---

## Fase 8 — Testes e documentação

Somente após os fluxos anteriores:

- mobile;
- desktop;
- mapa;
- filtros combinados;
- horários;
- cadastro;
- reserva;
- fila;
- aprovação automática;
- novos listings.

---

# 32. Critérios de aceite — Explorar espaços

- [ ] Existe "Explorar espaços" no header.
- [ ] Menu mostra Atividades, Tipos de espaço e Comodidades.
- [ ] Atividade leva à busca filtrada.
- [ ] Tipo leva à busca filtrada.
- [ ] Comodidade leva à busca filtrada.
- [ ] Funciona em desktop.
- [ ] Existe versão adequada no mobile.
- [ ] Não duplica os catálogos existentes.

---

# 33. Critérios de aceite — Todas as atividades

- [ ] Existe rota `/atividades`.
- [ ] Todas as atividades oficiais aparecem.
- [ ] Atividades são agrupadas de forma legível.
- [ ] Existe pesquisa textual quando o catálogo crescer.
- [ ] Clique leva à busca com filtro correto.
- [ ] Home possui botão "Ver todas as atividades".

---

# 34. Critérios de aceite — Home

- [ ] Nova seção aparece sem remover o fluxo "Como funciona".
- [ ] Links das atividades funcionam.
- [ ] CTA leva à página de atividades.
- [ ] Responsivo.
- [ ] Usa identidade Ágora, não cópia do Peerspace.

---

# 35. Critérios de aceite — Horário

- [ ] Usuário escolhe dia/período ou horário.
- [ ] Horário inicial e final são validados.
- [ ] Espaço sem locação horária não aparece.
- [ ] Duração mínima é respeitada.
- [ ] Janela permitida pelo dono é respeitada.
- [ ] Reserva usa intervalo real.
- [ ] Sobreposição parcial é detectada.
- [ ] E1 fila/conflito continua funcionando.
- [ ] Aprovação automática continua funcionando.

---

# 36. Critérios de aceite — Novo mapa/lista

- [ ] Lista ocupa área maior que a atual.
- [ ] Mapa permanece visível à direita no desktop.
- [ ] Lista pode rolar sem mover a página inteira.
- [ ] Mobile possui alternância adequada.
- [ ] Detalhe do espaço continua acessível.
- [ ] Não há quebra no fluxo de solicitação.

---

# 37. Critérios de aceite — Marcadores

- [ ] Marcador mostra preço.
- [ ] Preço/hora aparece quando busca for horária.
- [ ] Preço base aparece nos demais casos.
- [ ] Pin selecionado fica destacado.
- [ ] Hover do card destaca pin.
- [ ] Clique no pin destaca/rola até card.
- [ ] ACIT continua identificável.
- [ ] Locais Google não recebem preço inventado.

---

# 38. Critérios de aceite — Atualização pelo mapa

- [ ] Arrastar o mapa atualiza resultados.
- [ ] Zoom atualiza resultados.
- [ ] Atualização ocorre após movimento, não por frame.
- [ ] Existe debounce.
- [ ] Lista e pins permanecem sincronizados.
- [ ] Contagem mostra apenas resultados da área visível.
- [ ] Nenhum filtro ativo é perdido ao mover o mapa.

---

# 39. Testes obrigatórios

## Busca

Testar combinações:

```text
atividade + cidade
atividade + data
atividade + horário
tipo + comodidade
pets + área
ACIT + atividade
```

---

## Horário

```text
18:00 → 22:00
```

contra:

```text
21:00 → 23:00
```

Resultado:

```text
conflito
```

Testar limite:

```text
18:00 → 20:00
20:00 → 22:00
```

Resultado:

```text
sem conflito
```

---

## Mapa

Testar:

- zoom rápido;
- pan rápido;
- selecionar card enquanto viewport atualiza;
- selecionar pin;
- voltar da tela de detalhe;
- nenhum resultado na área;
- apenas um resultado;
- muitos marcadores próximos.

---

## Cadastro

Cadastrar espaço novo com:

```text
horário = sim
comodidades
pets
área
preço/hora
```

Homologar.

Verificar se aparece corretamente na busca.

---

# 40. Performance

## Mapa

Evitar:

```text
setState em todo cameraChanged
```

Preferir:

```text
idle
+
debounce
```

---

## Filtros

Usar:

```text
useMemo
```

no mock.

No backend real:

```text
consulta paginada
+
bounds
+
índices adequados
```

---

## Imagens

A página de atividades e cards deve:

- usar lazy loading;
- evitar imagens gigantes;
- reaproveitar assets quando possível.

---

# 41. Acessibilidade

- marcadores precisam de `aria-label`;
- menu deve funcionar por teclado;
- dropdown deve fechar com Escape;
- atividades devem ser links reais;
- filtros não podem depender apenas de cor;
- ACIT não pode ser identificado somente por cor;
- campos de data/hora precisam de labels.

---

# 42. Riscos

## Risco 1 — Taxonomia duplicada

Criar "atividades" sem reaproveitar `eventTypes`.

### Mitigação

Uma fonte de verdade.

---

## Risco 2 — Busca por horário quebrar reservas

O motor atual usa períodos fixos.

### Mitigação

Migrar disponibilidade para intervalos antes de liberar a UI horária.

---

## Risco 3 — Cadastro novo desaparecer dos filtros

Hoje dados do draft não são todos persistidos.

### Mitigação

Expandir `PublishedSpaceListing` na Fase 0.

---

## Risco 4 — Muitas chamadas ao mover o mapa

### Mitigação

`idle + debounce`.

---

## Risco 5 — Marcadores sobrepostos

Preço ocupa mais espaço que pin.

### Mitigação

- z-index;
- collision behavior quando disponível;
- clustering futuro se necessário;
- mostrar menos pins em zoom muito distante.

---

## Risco 6 — Tela de busca muito carregada

### Mitigação

Filtros rápidos mais usados + "Mais filtros".

---

# 43. Dependências com o backlog da equipe

## M4 — Marcadores

O novo price marker se sobrepõe ao item M4.

Coordenar antes de implementar para evitar retrabalho.

---

## R1 — Pesquisa assistida por IA

Este plano **não implementa IA**.

A nova taxonomia e ActivityPicker devem ser construídos de modo que R1 possa usar o mesmo catálogo depois.

---

## R2 — Remover organizador

Evitar acoplar os novos componentes ao papel `organizador`.

O menu Explorar e a busca devem ser componentes independentes de role.

---

# 44. Documentação a atualizar durante a implementação

A regra do repositório exige atualização simultânea dos docs.

## Obrigatórios

```text
docs/mapa-busca.md
docs/busca-locacao.md
docs/fluxo-telas.md
docs/espacos.md
docs/agenda-calendario.md
docs/reservas.md
docs/mvp.md
README.md
docs/IMPLEMENTACAO.md
```

## Comodidades

Se a forma de navegação/filtro mudar:

```text
docs/comodidades.md
```

## Stack

Se forem adicionadas bibliotecas:

```text
docs/stack.md
```

---

# 45. Pontos de documentação encontrados para revisão

Estes itens **não fazem parte diretamente da feature**, mas foram encontrados na revisão do snapshot e devem ser corrigidos em uma etapa de manutenção documental:

## 45.1 Merge conflict em rascunho

Arquivo:

```text
docs/rascunhos/painel-acit.md
```

contém marcadores:

```text
<<<<<<< HEAD
=======
>>>>>>> ...
```

Isso indica conflito de merge não resolvido no documento.

---

## 45.2 Nome comercial desatualizado em alguns docs

Alguns documentos ainda dizem:

```text
nome comercial a definir
```

apesar de:

```text
docs/nomenclatura.md
```

já definir:

```text
Ágora
```

Exemplos encontrados:

```text
docs/mvp.md
docs/visao-geral.md
docs/pagamento-demo.md
```

---

## 45.3 Status T07+ desatualizado

`docs/fluxo-telas.md` ainda indica parte de T07+ como não implementada.

Porém o histórico e o código mais recente já possuem:

```text
/minhas-reservas
notificações
pagamento demo
fluxos E1–E5
```

Esses estados devem ser reconciliados quando a próxima rodada documental for feita.

---

# 46. Sequência de desenvolvimento recomendada

Resumo:

```text
0. Normalizar dados
        ↓
1. Catálogo de descoberta
        ↓
2. Explorar espaços no header
        ↓
3. Página Todas as atividades
        ↓
4. Seção de atividades na home
        ↓
5. Busca por data/hora real
        ↓
6. Layout lista maior + mapa direita
        ↓
7. Marcadores de preço
        ↓
8. Atualização por viewport
        ↓
9. Filtros rápidos
        ↓
10. Testes + docs
```

---

# 47. Divisão sugerida em entregas pequenas

## Entrega A — Descoberta

Escopo:

- menu Explorar;
- catálogo;
- `/atividades`;
- seção da home.

Baixo risco sobre reservas.

---

## Entrega B — Busca temporal

Escopo:

- data início/fim;
- horário;
- startsAt/endsAt;
- disponibilidade;
- cadastro de janela horária.

Maior risco técnico.

---

## Entrega C — Resultados + mapa

Escopo:

- novo split;
- cards;
- price markers;
- hover;
- viewport.

Alta visibilidade na apresentação.

---

## Entrega D — Polimento

Escopo:

- filtros rápidos;
- acessibilidade;
- responsividade;
- performance;
- documentação.

---

# 48. Definição de pronto

A implementação só deve ser considerada concluída quando o usuário conseguir executar o seguinte fluxo:

```text
Landing
   ↓
Explorar espaços
   ↓
Atividades
   ↓
Aniversário
   ↓
Cidade + data + horário
   ↓
Resultados
   ↓
lista ampla + mapa
   ↓
mapa mostra preços
   ↓
zoom/pan altera os resultados
   ↓
seleciona card/pin
   ↓
detalhe
   ↓
solicitação
   ↓
motor E1–E5
```

Sem criar regras paralelas de:

- disponibilidade;
- atividades;
- comodidades;
- reserva.

---

# 49. Referências externas de UX

Referências consultadas para o planejamento:

- Peerspace — página inicial: https://www.peerspace.com/
- Peerspace — All Activities: https://www.peerspace.com/plan/activities
- Peerspace Support — busca, filtros, mapa e tipos de espaço: https://support.peerspace.com/en/articles/10119108-how-do-i-find-the-right-space-for-my-booking
- Peerspace Support — tipos de espaço: https://support.peerspace.com/en/articles/10119342-how-should-i-categorize-my-space
- Peerspace Support — modelo de preço por hora: https://support.peerspace.com/en/articles/10119425-how-should-i-price-my-space

Essas referências servem para estudar padrões de UX e produto. A implementação final deve manter identidade visual, regras e diferenciais próprios da Ágora.

---

# 50. Decisão de arquitetura central

A principal recomendação deste plano é:

```text
NÃO criar uma camada nova e independente de descoberta.
```

A evolução deve reutilizar o que o projeto já possui:

```text
eventTypes
     ↓
Atividades

spaceClasses
     ↓
Tipos de espaço

amenityCatalog
     ↓
Comodidades

reservations.ts
     ↓
Disponibilidade real

Google Maps
     ↓
Mapa + viewport + price markers
```

Assim, o novo fluxo inspirado no Peerspace melhora a experiência sem quebrar as regras já implementadas na Ágora.
