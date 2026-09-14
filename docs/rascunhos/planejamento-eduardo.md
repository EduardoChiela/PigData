# Especificação de Implementação — Reservas, calendário e comunicação

> **Pacote:** Eduardo (E1–E5) · [backlog-equipe.md](./backlog-equipe.md)  
> **Origem:** especificação aprovada pelo integrante (Downloads)  
> **No repo:** `docs/rascunhos/planejamento-eduardo.md`

## Status

**Decisões aprovadas — núcleo mock implementado (2026-09-14).** E-mail/WhatsApp providers e Google Calendar OAuth permanecem para etapas posteriores / backend.

Decisões aprovadas:

| ID | Tema | Decisão |
|---|---|---|
| E1 | Conflito de datas | Adotar o modelo de múltiplas solicitações concorrentes. Somente a reserva efetivamente confirmada bloqueia o período. Solicitações conflitantes permanecem em fila/interesse. |
| E2 | Solicitações no calendário | Exibir solicitações pendentes, reservas confirmadas, bloqueios manuais e indisponibilidades externas na mesma visão de calendário, com estados visuais diferentes. |
| E3 | Aprovação automática | O proprietário poderá escolher aprovação manual ou aprovação automática baseada em requisitos estruturados. |
| E4 | E-mail / WhatsApp | A Ágora continua sendo a fonte de verdade. E-mail e WhatsApp funcionam como canais de comunicação e, futuramente, como pontos de entrada para ações. |
| E5 | Notificação ao cliente | Criar notificação persistente dentro da plataforma e feedback imediato quando houver mudança relevante no status da reserva. |

---

# 1. Objetivo

Implementar um fluxo de reservas que:

- permita múltiplas solicitações pelo mesmo período;
- impeça dupla confirmação;
- suporte aprovação manual e automática;
- represente todos os estados relevantes no calendário;
- mantenha a Ágora como fonte de verdade;
- notifique cliente e proprietário;
- permita expansão futura para Google Calendar, e-mail e WhatsApp;
- seja compatível com pagamento real ou modo de demonstração.

---

# 2. Princípios obrigatórios

## 2.1 Fonte de verdade

A fonte de verdade de reservas, disponibilidade e estados deve ser o backend/banco da Ágora.

E-mail, WhatsApp, Google Calendar e frontend não podem possuir estados independentes capazes de contradizer o banco.

```text
BANCO ÁGORA
    ↓
estado oficial
    ↓
frontend / calendário / e-mail / WhatsApp
```

---

## 2.2 Validação no backend

Toda ação crítica deve ser revalidada no backend.

Exemplos:

- aprovação;
- aprovação automática;
- confirmação;
- pagamento;
- alteração de período;
- cancelamento;
- aceite vindo do WhatsApp.

O frontend nunca deve ser a única proteção contra conflito.

---

## 2.3 Solicitação não é reserva confirmada

Uma solicitação representa interesse.

```text
SOLICITAÇÃO ≠ RESERVA CONFIRMADA
```

Enquanto não houver confirmação, outras solicitações podem existir para o mesmo intervalo.

---

# 3. Estados da reserva

## 3.1 Estados propostos

A implementação deve possuir uma máquina de estados explícita.

```text
requested
pending
auto_approved
approved
awaiting_payment
confirmed
conflict
waitlisted
rejected
cancelled
expired
```

Os nomes podem ser adaptados ao padrão já utilizado no código, desde que os significados sejam preservados.

---

## 3.2 Significado dos estados

### `requested`

Solicitação criada pelo cliente.

Ainda não foi processada pela regra de aprovação.

### `pending`

Aguardando análise manual do proprietário.

### `auto_approved`

A solicitação passou automaticamente pelos requisitos configurados pelo proprietário.

Ainda pode depender de pagamento antes da confirmação definitiva.

### `approved`

Aprovada manualmente pelo proprietário.

Ainda pode depender de pagamento.

### `awaiting_payment`

A solicitação está aprovada e aguarda conclusão do pagamento.

### `confirmed`

Reserva efetivamente confirmada.

**Este estado bloqueia o período no calendário.**

### `conflict`

A solicitação passou a conflitar com uma reserva confirmada.

### `waitlisted`

Solicitação mantida em fila/interesse caso o período volte a ficar disponível.

### `rejected`

Solicitação recusada.

### `cancelled`

Reserva ou solicitação cancelada.

### `expired`

Solicitação ou pagamento perdeu validade por tempo.

---

# 4. Transições permitidas

Fluxo principal:

```text
requested
    ↓
verificar regras
    │
    ├── manual
    │     ↓
    │   pending
    │     ↓
    │   approved
    │
    └── automática
          ↓
      auto_approved
          │
          └───────┐
                  ▼
          awaiting_payment
                  ↓
              confirmed
```

Caminhos alternativos:

```text
pending → rejected
pending → expired
approved → cancelled
auto_approved → cancelled
awaiting_payment → expired
confirmed → cancelled
```

Em caso de concorrência:

```text
requested/pending
        ↓
outra reserva é confirmada
        ↓
conflict
        ↓
waitlisted
```

Se a data voltar a ficar disponível:

```text
waitlisted
    ↓
pending
```

ou nova análise automática, conforme a regra adotada.

---

# 5. E1 — Conflito de datas e fila

## 5.1 Regra aprovada

A Ágora permitirá várias solicitações concorrentes para o mesmo espaço e intervalo.

Exemplo:

```text
15/10/2026

Eduardo
18:00 → 23:00
PENDENTE

Mariana
19:00 → 22:00
PENDENTE

Carlos
20:00 → 23:00
PENDENTE
```

Nenhuma delas bloqueia definitivamente o período.

---

## 5.2 Confirmação

Quando uma reserva for confirmada:

```text
Eduardo
18:00 → 23:00
CONFIRMED
```

as demais solicitações que se sobrepõem passam para:

```text
CONFLICT
```

e podem ser mantidas como:

```text
WAITLISTED
```

---

## 5.3 Regra de sobreposição

Utilizar a regra:

```text
requested_start < existing_end
AND
requested_end > existing_start
```

Não há conflito quando:

```text
Reserva A
18:00 → 20:00

Reserva B
20:00 → 22:00
```

desde que a regra de negócio considere o fim como limite exclusivo.

---

## 5.4 Verificação final

Antes de mudar qualquer reserva para `confirmed`:

1. iniciar transação;
2. consultar conflitos confirmados para o espaço;
3. bloquear/proteger os registros necessários;
4. confirmar somente se o intervalo continuar livre;
5. atualizar solicitações concorrentes;
6. finalizar a transação.

Pseudocódigo:

```text
BEGIN

check_confirmed_conflicts(space_id, starts_at, ends_at)

if conflict:
    reject_confirmation
else:
    set reservation = confirmed
    move overlapping requests to conflict/waitlisted

COMMIT
```

A implementação precisa evitar race condition.

---

## 5.5 Cancelamento e reativação da fila

Quando uma reserva confirmada for cancelada:

```text
confirmed → cancelled
```

o sistema deve procurar solicitações em fila que tenham interseção com aquele período.

Essas solicitações podem voltar para análise.

Fluxo:

```text
reserva cancelada
      ↓
buscar waitlisted
      ↓
período disponível?
      ↓
notificar interessados
```

A primeira versão não precisa confirmar automaticamente um item da fila.

---

# 6. E2 — Calendário

## 6.1 Objetivo

A visão de calendário deve representar a situação real do espaço.

Tipos previstos:

```text
solicitação pendente
reserva confirmada
bloqueio manual
ocupação externa
```

---

## 6.2 Legenda conceitual

Exemplo:

```text
Pendente             → solicitação
Confirmada           → reserva
Bloqueado            → bloqueio manual
Ocupado externamente → Google Calendar
```

A cor final deve seguir o design system.

A interface também precisa usar texto/ícone para acessibilidade.

---

## 6.3 Regras de bloqueio

| Tipo | Bloqueia disponibilidade? |
|---|---|
| Solicitação pendente | Não |
| Aprovada aguardando pagamento | Decisão ligada à política de hold, ver seção 6.4 |
| Reserva confirmada | Sim |
| Bloqueio manual | Sim |
| Google Calendar ocupado | Sim |
| Cancelada | Não |
| Rejeitada | Não |
| Expirada | Não |

---

## 6.4 Hold temporário para pagamento

Recomenda-se prever um hold temporário quando uma solicitação já estiver aprovada e aguardando pagamento.

Exemplo:

```text
approved
   ↓
hold de 15 minutos
   ↓
awaiting_payment
```

Enquanto o hold estiver válido:

```text
período temporariamente indisponível
```

Se o pagamento expirar:

```text
awaiting_payment → expired
```

e o período volta a ficar disponível.

**O tempo de hold deve ser configurável.**

Para a apresentação com pagamento demo, o mesmo mecanismo pode ser utilizado com tempo reduzido.

---

## 6.5 Fontes do calendário

```text
calendar_source
--------------------------------
agora_request
agora_reservation
manual_block
google_calendar
```

---

## 6.6 Modelo conceitual

Pode existir uma entidade dedicada:

```text
calendar_entries
--------------------------------
id
space_id
type
source
reservation_id
starts_at
ends_at
status
metadata
created_at
updated_at
```

Ou a visão pode ser montada a partir das tabelas existentes.

A decisão deve respeitar o schema atual e evitar duplicar fonte de verdade.

---

# 7. Google Calendar

## 7.1 Papel da integração

Google Calendar representa indisponibilidade externa.

Não deve substituir a agenda interna da Ágora.

```text
AGENDA ÁGORA
+
GOOGLE CALENDAR
=
DISPONIBILIDADE EFETIVA
```

---

## 7.2 Comportamento

Intervalos ocupados no Google devem ser tratados como:

```text
external_busy
```

e bloquear novas confirmações.

---

## 7.3 Sincronização

Primeira versão possível:

```text
consulta periódica
```

Evolução:

```text
Google Calendar push notifications
+
sincronização incremental
```

---

# 8. E3 — Aprovação automática

## 8.1 Configuração do proprietário

O proprietário deve escolher:

```text
Modo de reserva

( ) Aprovação manual
( ) Aprovação automática
```

Modelo conceitual:

```text
booking_mode = manual
```

ou:

```text
booking_mode = automatic
```

---

## 8.2 Requisitos automáticos

A aprovação automática deve depender apenas de regras estruturadas.

Exemplos:

```text
capacidade máxima
tipos de evento permitidos
antecedência mínima
duração mínima
duração máxima
horário permitido
pets
som
bebida
seguro
```

---

## 8.3 Exemplo

```text
Solicitação

150 convidados
Casamento
15/10
18:00 → 23:00
```

Regras:

```text
Capacidade máxima: 200        ✓
Casamento permitido           ✓
Horário até 23:00             ✓
Antecedência mínima           ✓
Agenda livre                  ✓
```

Resultado:

```text
auto_approved
```

---

## 8.4 Falha em requisito

Se algum requisito falhar:

```text
regra não atendida
       ↓
pending
```

O proprietário pode analisar manualmente.

Não rejeitar automaticamente quando uma exceção puder ser autorizada.

---

## 8.5 Conflito tem prioridade

Mesmo que todos os requisitos automáticos estejam corretos:

```text
se existe conflito confirmado
→ não aprovar
```

A disponibilidade sempre tem prioridade.

---

## 8.6 Modelo de dados

Opção simples:

```text
spaces
--------------------------------
booking_mode
min_notice_hours
min_duration_minutes
max_duration_minutes
booking_start_time
booking_end_time
```

Regras mais complexas podem ir para:

```text
space_booking_rules
--------------------------------
id
space_id
rule_type
operator
value
enabled
created_at
updated_at
```

---

# 9. E4 — E-mail e WhatsApp

## 9.1 Regra aprovada

E-mail e WhatsApp não criam um sistema paralelo.

```text
ÁGORA
=
fonte de verdade
```

---

## 9.2 E-mail — primeira etapa

Eventos que devem poder gerar e-mail:

```text
nova solicitação
solicitação aprovada
solicitação rejeitada
pagamento necessário
reserva confirmada
reserva cancelada
data disponível novamente
```

---

## 9.3 Exemplo para proprietário

```text
Nova solicitação de reserva

Espaço: Casa de Eventos X
Data: 15/10/2026
Horário: 18:00 → 23:00
Convidados: 150

[ Ver solicitação ]
```

O link deve levar à página autenticada correspondente.

---

## 9.4 WhatsApp — segunda etapa

Primeiro uso recomendado:

```text
notificação
+
link para a Ágora
```

Exemplo:

```text
Nova solicitação para Casa de Eventos X.

15/10/2026
18:00 → 23:00

[ Ver solicitação ]
```

---

## 9.5 Ações via WhatsApp — evolução

No futuro:

```text
[ Aceitar ]
[ Recusar ]
[ Ver detalhes ]
```

Uma ação precisa sempre passar pela API.

```text
WhatsApp
   ↓
backend
   ↓
autenticação/validação
   ↓
revalidar conflito
   ↓
alterar estado
```

---

## 9.6 Log de comunicação

Modelo sugerido:

```text
communication_log
--------------------------------
id
user_id
reservation_id
channel
event_type
recipient
status
provider_message_id
sent_at
delivered_at
read_at
failed_at
created_at
```

Canais:

```text
in_app
email
whatsapp
```

Status:

```text
queued
sent
delivered
read
failed
```

---

# 10. E5 — Notificações

## 10.1 Notificação persistente

Criar central de notificações.

Modelo:

```text
notifications
--------------------------------
id
user_id
reservation_id
type
title
body
read_at
created_at
```

---

## 10.2 Tipos iniciais

```text
reservation_requested
reservation_approved
reservation_auto_approved
reservation_rejected
reservation_confirmed
reservation_cancelled
reservation_conflict
payment_required
payment_confirmed
waitlist_available
```

---

## 10.3 Feedback imediato

Se o cliente estiver com a plataforma aberta:

```text
✓ Sua solicitação foi aceita
```

Depois:

```text
[ Continuar para pagamento ]
```

---

## 10.4 Persistência

Mesmo que o cliente esteja offline:

```text
evento ocorre
   ↓
notification criada
   ↓
cliente entra depois
   ↓
notificação continua disponível
```

---

## 10.5 Realtime

Preferencial:

```text
WebSocket
SSE
Supabase Realtime
ou tecnologia equivalente
```

Fallback:

```text
polling
```

O mecanismo deve seguir o stack atual do projeto.

---

# 11. Eventos de domínio

Para evitar lógica duplicada, recomenda-se tratar alterações importantes como eventos internos.

Exemplos:

```text
ReservationRequested
ReservationApproved
ReservationAutoApproved
ReservationConfirmed
ReservationRejected
ReservationCancelled
ReservationConflictDetected
PaymentRequired
PaymentConfirmed
WaitlistSlotAvailable
```

Consumidores possíveis:

```text
calendário
notificações
e-mail
WhatsApp
auditoria
```

Exemplo:

```text
ReservationConfirmed
        │
        ├── atualizar calendário
        ├── criar notificação
        ├── enviar e-mail
        ├── marcar concorrentes como conflito
        └── registrar auditoria
```

---

# 12. APIs sugeridas

Os nomes são conceituais e devem ser adaptados ao padrão atual.

## Cliente

```text
POST /reservations/requests
GET  /reservations/my
GET  /reservations/:id
POST /reservations/:id/cancel
```

---

## Proprietário

```text
GET   /owner/reservation-requests
POST  /owner/reservations/:id/approve
POST  /owner/reservations/:id/reject
POST  /owner/reservations/:id/cancel
```

---

## Calendário

```text
GET  /spaces/:spaceId/calendar
POST /spaces/:spaceId/calendar/blocks
DELETE /spaces/:spaceId/calendar/blocks/:id
```

---

## Notificações

```text
GET   /notifications
PATCH /notifications/:id/read
POST  /notifications/read-all
```

---

## Configuração de reservas

```text
GET   /spaces/:spaceId/booking-settings
PATCH /spaces/:spaceId/booking-settings
```

---

# 13. Regra de confirmação

A confirmação deve ser centralizada em um único serviço.

Exemplo conceitual:

```text
ReservationConfirmationService
```

Responsabilidades:

1. validar usuário/permissão;
2. validar estado atual;
3. validar período;
4. consultar bloqueios internos;
5. consultar indisponibilidade externa quando aplicável;
6. verificar race condition;
7. confirmar;
8. atualizar concorrentes;
9. emitir eventos;
10. gerar notificações.

Nenhum controller ou tela deve duplicar essas regras.

---

# 14. Auditoria

Mudanças de reserva importantes devem possuir histórico.

Modelo possível:

```text
reservation_history
--------------------------------
id
reservation_id
from_status
to_status
actor_type
actor_id
reason
metadata
created_at
```

Actor:

```text
customer
owner
system
admin
```

Exemplo:

```text
pending
→ auto_approved
actor = system
```

---

# 15. Telas do cliente

## Minhas solicitações / reservas

Exibir:

```text
espaço
data
horário
status
próxima ação
```

Exemplos:

```text
Aguardando proprietário
```

```text
Aprovada — realize o pagamento
```

```text
Confirmada
```

```text
Em fila
```

---

# 16. Telas do proprietário

## Solicitações

Lista contendo:

```text
cliente
espaço
data
horário
quantidade de pessoas
tipo de evento
status
conflito
```

Ações:

```text
[ Ver detalhes ]
[ Aprovar ]
[ Recusar ]
```

---

## Calendário

Ao clicar em uma entrada:

```text
tipo
cliente
período
status
origem
ações possíveis
```

---

# 17. Estados exibidos ao usuário

Evitar mostrar nomes técnicos como:

```text
auto_approved
waitlisted
```

Mapeamento sugerido:

| Estado técnico | Cliente |
|---|---|
| requested | Solicitação enviada |
| pending | Aguardando aprovação |
| auto_approved | Aprovada automaticamente |
| approved | Solicitação aprovada |
| awaiting_payment | Aguardando pagamento |
| confirmed | Reserva confirmada |
| conflict | Período ocupado |
| waitlisted | Na fila de interesse |
| rejected | Solicitação recusada |
| cancelled | Cancelada |
| expired | Solicitação expirada |

---

# 18. Testes obrigatórios

## E1 — conflito

Testar:

```text
duas solicitações no mesmo horário
```

Resultado:

```text
permitidas
```

Depois:

```text
confirmar uma
```

Resultado:

```text
segunda → conflict/waitlisted
```

---

## Race condition

Executar duas confirmações simultâneas.

Resultado esperado:

```text
somente uma confirmed
```

---

## Sobreposição parcial

```text
18:00 → 22:00
21:00 → 23:00
```

Resultado:

```text
conflito
```

---

## Limite sem sobreposição

```text
18:00 → 20:00
20:00 → 22:00
```

Resultado:

```text
permitido
```

---

## Aprovação automática

Testar:

- todas as regras atendidas;
- uma regra não atendida;
- data indisponível;
- capacidade excedida;
- horário inválido;
- requisito inexistente;
- mudança de regra após solicitação.

---

## Cancelamento

Testar:

```text
confirmed → cancelled
```

e verificar fila.

---

## Comunicação

Falha de e-mail ou WhatsApp não deve desfazer uma reserva.

---

## Notificações

Testar:

- criação;
- leitura;
- usuário offline;
- duplicidade;
- realtime;
- link para reserva correta.

---

# 19. Ordem de implementação

## Etapa 1 — Estados e regras centrais

- definir enum/estados;
- definir transições;
- criar histórico;
- definir quais estados bloqueiam calendário.

## Etapa 2 — Conflito

- função única de detecção;
- proteção transacional;
- race condition;
- fila de interesse.

## Etapa 3 — Calendário

- solicitações;
- confirmadas;
- bloqueios;
- fonte externa.

## Etapa 4 — Aprovação manual

- tela;
- endpoints;
- confirmação.

## Etapa 5 — Aprovação automática

- configurações;
- motor de regras;
- auditoria da aprovação automática.

## Etapa 6 — Notificações in-app

- tabela;
- central;
- feedback imediato;
- realtime/polling.

## Etapa 7 — E-mail

- templates;
- filas/retry;
- logs.

## Etapa 8 — WhatsApp

- templates;
- webhook;
- notificações;
- depois ações.

## Etapa 9 — Google Calendar

- consulta de busy;
- sincronização;
- tratamento de falhas.

---

# 20. Critérios de aceite gerais

A implementação estará funcional quando:

- mais de uma solicitação puder existir para o mesmo período;
- apenas uma reserva puder ser confirmada no mesmo intervalo;
- o backend impedir race condition;
- concorrentes forem movidos para conflito/fila;
- cancelamento reabrir possibilidade para interessados;
- calendário distinguir todos os estados;
- proprietário escolher aprovação manual ou automática;
- motor automático respeitar regras;
- conflito sempre tenha prioridade sobre autoaprovação;
- cliente seja notificado de mudanças;
- notificações persistam;
- e-mail não seja fonte de verdade;
- WhatsApp não seja fonte de verdade;
- falha de comunicação não altere reserva;
- histórico de mudanças seja auditável.

---

# 21. Arquivos de documentação afetados

Quando a implementação for iniciada, revisar e atualizar os documentos oficiais relacionados a:

```text
reservas.md
agenda-calendario.md
busca-locacao.md
painel do proprietário
pagamentos
notificações/comunicação
Google Calendar
IMPLEMENTACAO.md
```

## Alteração de regra de produto

E3 deve ser registrado explicitamente como alteração da regra de produto:

```text
Antes:
toda solicitação depende de análise manual

Depois:
o proprietário escolhe entre análise manual
ou aprovação automática por requisitos
```

---

# 22. Registro sugerido para IMPLEMENTACAO.md

Quando o desenvolvimento começar, registrar uma entrada contendo no mínimo:

```text
Título:
Reservas concorrentes, calendário e aprovação automática

Contexto:
Implementação dos itens E1 a E5 aprovados após pesquisa.

Áreas afetadas:
- reservas
- agenda
- painel do proprietário
- notificações
- comunicação
- pagamentos

Mudanças:
- solicitações concorrentes
- fila de interesse
- proteção contra conflito
- calendário consolidado
- aprovação automática
- notificações persistentes
- preparação para e-mail e WhatsApp

Status:
em implementação
```

---

# 23. Pontos que não devem ser improvisados durante a implementação

Se algum destes itens ainda não existir oficialmente no projeto, fechar a decisão antes de codificar:

1. tempo do hold de pagamento;
2. tempo para expiração de uma solicitação;
3. ordem/prioridade da fila;
4. se a fila reabre automaticamente ou apenas notifica;
5. antecedência padrão;
6. política de cancelamento;
7. política de reembolso;
8. quando uma reserva aprovada passa a bloquear temporariamente;
9. comportamento em caso de indisponibilidade do Google Calendar;
10. quais requisitos podem ser usados na aprovação automática.

---

# 24. Resumo da arquitetura

```text
                      ÁGORA
                        │
                        ▼
               Solicitação criada
                        │
                        ▼
                 Validar período
                        │
              ┌─────────┴─────────┐
              │                   │
        conflito confirmado      livre
              │                   │
              ▼                   ▼
            fila          modo de aprovação
                                  │
                         ┌────────┴────────┐
                         │                 │
                       manual          automático
                         │                 │
                         ▼                 ▼
                      pending       validar regras
                         │                 │
                         └────────┬────────┘
                                  ▼
                              approved
                                  │
                                  ▼
                          awaiting_payment
                                  │
                                  ▼
                              confirmed
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                calendário   notificações   comunicação
                                  │
                           ┌──────┴──────┐
                           ▼             ▼
                         e-mail       WhatsApp
```

---

# 25. Decisão final

Os itens E1 a E5 estão aprovados para seguir para implementação com as seguintes regras centrais:

**E1:** múltiplas solicitações podem disputar o mesmo período; apenas a confirmação bloqueia definitivamente.

**E2:** solicitações, reservas, bloqueios e ocupações externas aparecem no calendário com estados diferentes.

**E3:** o proprietário escolhe entre aprovação manual e automática. A aprovação automática utiliza somente requisitos estruturados e sempre respeita disponibilidade.

**E4:** e-mail e WhatsApp complementam a plataforma; não substituem o backend de reservas.

**E5:** alterações de status geram notificações persistentes e, quando possível, atualização em tempo real.

Toda a implementação deve partir de uma única máquina de estados e de uma única regra de conflito para evitar comportamentos divergentes entre reserva, calendário, pagamento e comunicação.
