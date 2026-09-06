# Agendar Visita — Documentação da Feature

> Status: **rascunho de discussão**, ainda não incorporado aos docs oficiais do projeto (`docs/reservas.md`, `docs/espacos.md`). Guardar aqui até fecharmos o desenho e decidirmos formalizar.

## 1. Objetivo

Permitir que o cliente, ao ver o perfil de um espaço, sinalize interesse em **conhecer o local pessoalmente antes de decidir** — sem criar um sistema novo de agenda/aprovação. A combinação do horário em si acontece fora da plataforma, direto no WhatsApp do proprietário, seguindo o princípio já registrado em `visao-geral.md`: **"não substitui o WhatsApp no dia a dia — acelera a pergunta certa"**.

Não é um sistema de reserva de horário de visita (com calendário próprio, aprovação, conflito de slots) — é um **atalho de contato qualificado**.

## 2. Fluxo

```mermaid
flowchart TD
    A[Cliente abre o perfil do espaço] --> B{Gostaria de agendar<br/>uma visita?}
    B -- Não / ignora --> C[Continua navegando o perfil normalmente]
    B -- Sim --> D[Sistema registra o pedido<br/>com tag "Visita" no painel do espaço]
    D --> E[Monta mensagem padrão:<br/>"Gostaria de marcar uma visita!"]
    E --> F["Abre WhatsApp do proprietário<br/>(wa.me/telefone) com a mensagem pronta"]
    F --> G[Cliente e espaço combinam<br/>o horário direto na conversa]
```

## 3. Onde aparece na interface

Um bloco simples dentro do `space-detail-panel` (componente já existente no protótipo), **ao lado do botão "Solicitar reserva"** — não como pop-up/modal intrusivo:

```
Quer conhecer pessoalmente?
[ Agendar visita ]
```

Duas ações lado a lado, propósitos diferentes: "Solicitar reserva" (compromisso de evento) e "Agendar visita" (conhecer antes de decidir) — uma não substitui a outra.

## 4. Mensagem padrão

**Sempre genérica, igual pra todo mundo** (decisão fechada — sem personalização com nome do espaço/data por enquanto):

```text
Gostaria de marcar uma visita!
```

Enviada via deep link:

```text
https://wa.me/<telefone_do_espaco>?text=Gostaria%20de%20marcar%20uma%20visita!
```

O telefone já é campo **obrigatório** no cadastro do espaço (definido no fluxo de cadastro assistido pelo Google — ver `docs/cadastro-assistido-google.md` e `formulario-cadastro-espaco.md`), então **nenhum cadastro adicional é necessário** para essa feature funcionar.

## 5. Registro do pedido (decisão fechada)

O clique em "Sim" **gera um registro no sistema antes de redirecionar** para o WhatsApp — não é um redirecionamento silencioso.

- Aparece no **painel do espaço**, na mesma lista de pedidos de reserva, com uma **tag "Visita"** que o diferencia de um pedido de reserva de evento
- Alimenta as métricas de impacto (`docs/metricas-impacto.md`) — permite medir "X pedidos de visita no mês" sem precisar rastrear o que aconteceu depois na conversa
- O que acontece depois (se a visita foi marcada, remarcada, ou nem aconteceu) **fica fora do sistema** — a plataforma não tenta controlar isso

## 6. Modelo de dados (rascunho conceitual)

- **VisitaSolicitada** — `{ id, espaco_id, cliente_id (se autenticado), criado_em }`
- Não precisa de: horário da visita, status de aprovação, duração, conflito de agenda — esses campos só existiriam se fosse o modelo completo de agenda de visitas (descartado em favor da versão simples)
- Aparece no painel do espaço junto com `PedidoReserva`, distinguido só pelo campo de tipo/tag

## 7. Decisões já fechadas nesta conversa

1. **Sem agenda de visitas própria** — descartado o modelo com slots de horário, confirmação automática e bloqueio de agenda (era a proposta inicial, mais complexa); optou-se pela versão simples de encaminhamento
2. **Mensagem padrão genérica**, sem personalização com nome do espaço ou data buscada
3. **O clique registra um pedido com tag "Visita"** no painel do espaço — não é um redirecionamento sem rastro
4. **Agendamento do horário acontece 100% no WhatsApp**, fora da plataforma — a plataforma não administra confirmação, remarcação ou no-show de visita

## 8. Relação com os docs existentes

- Reaproveita o campo `telefone` (obrigatório) do cadastro — ver [`formulario-cadastro-espaco.md`](./formulario-cadastro-espaco.md) e `docs/cadastro-assistido-google.md`
- Aparece ao lado do fluxo de pedido já documentado em `docs/reservas.md`
- Alimenta os indicadores já previstos em `docs/metricas-impacto.md`
- Reforça o princípio "Brasil-first / não substitui o WhatsApp" já registrado em `docs/visao-geral.md`

---
*Gerado a partir da conversa de definição de produto — reflete decisões até o momento, sujeito a mudança até ser formalizado nos docs oficiais do repositório.*
