# Agenda e calendário compartilhado

## Objetivo

Fonte única da verdade: **quais datas/horários estão livres** em cada espaço — e, na rede, quais parceiros podem cobrir uma indisponibilidade.

## Modalidades de locação

O espaço declara se aceita **dia/período** e/ou **por horário** (pelo menos uma). Detalhe e campos: [busca-locacao.md](./busca-locacao.md#4-locação-por-diaperíodo-ou-por-horário).

- Busca por período: livre só se o intervalo inteiro estiver livre
- Busca por horário: timestamps `starts_at` / `ends_at`; espaços sem horário habilitado não entram
- Conflito: sobreposição de intervalos

## Agenda individual (Fase 1)

- Espaço marca: livre, ocupado, bloqueado (em dia ou faixa horária, conforme modalidade)
- Busca usa essa agenda para filtrar o mapa
- Meta: resposta em minutos, não em dias de WhatsApp

## Calendário compartilhado / parceria (Fase 2)

- Vínculos entre cadastros (espaço ↔ organizador ↔ outros espaços)
- Se A está ocupado no intervalo X → sugerir B, C, D parceiros livres
- Organizador: visão multi-espaço no intervalo pedido

## Google Calendar (opcional, independente do Places)

O cadastro assistido via Places ([cadastro-assistido-google.md](./cadastro-assistido-google.md)) **não** conecta Calendar automaticamente.

Ordem de onboarding:

1. Identificar espaço (Places ou manual)
2. Completar dados de locação na plataforma
3. Configurar disponibilidade na **agenda da plataforma** (dia e/ou horário)
4. Opcional: conectar Google Calendar (OAuth próprio)

Existir no Google Maps ≠ Calendar disponível. A agenda da plataforma é a fonte da busca; sync externo é complemento. Locação por horário aumenta a complexidade do sync — tratar com cuidado.

## Riscos

- Agenda desatualizada destrói a confiança do produto
- Locação por horário exige regras claras de conflito e preço/hora
- Alguns espaços podem resistir a “expor” disponibilidade

## Estado da implementação

- Modalidades dia/horário definidas em produto; ainda sem código de agenda.
- Sync Google Calendar: opcional pós-agenda nativa.
