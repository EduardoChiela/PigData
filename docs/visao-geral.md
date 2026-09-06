# Visão geral

## Problema

Quem busca local para evento na cidade precisa contatar estabelecimentos um a um para checar datas. Isso é lento, gera desistência (~30% dos clientes) e desperdiça +1.700 horas/ano das equipes comerciais em consultas que muitas vezes não viram reserva.

## Proposta

Plataforma estilo Airbnb/PeerSpace para **espaços de eventos**, com:

1. Disponibilidade em tempo real
2. Mapa interativo **3D com relevo**
3. Calendário compartilhado entre parceiros (rede ACIT)
4. Fluxo de pedido/reserva sem recomeçar a busca do zero

## Referência PeerSpace (o que copiar)

- Marketplace bilateral: espaços (oferta) + organizadores/clientes (demanda)
- Listagem com fotos, preço, capacidade, regras
- Agenda do espaço + busca por data
- Pedido de aprovação e/ou reserva imediata (Instant Book)
- Confiança: perfil, mensagens, avaliações; pagamento/comissão em fases posteriores

## Diferenciais deste projeto

- **Disponibilidade-first:** entrada por cidade + data/período/horário → mapa prioriza livres
- **Comodidades na busca e no pedido:** catálogo único + carrinho de cotação ([comodidades.md](./comodidades.md))
- **Busca rica:** favoritos, m², pets, atributos elétricos/janelas ([busca-locacao.md](./busca-locacao.md))
- **Cadastro assistido (Places):** identificação no Google + locação na plataforma ([cadastro-assistido-google.md](./cadastro-assistido-google.md))
- **Calendário de parceria:** “não tenho → a rede tem”
- **Destaque ACIT verificado:** selo e prioridade no mapa/lista
- **Mapa híbrido:** parceiros em primeiro plano; Google na busca só como cobertura limitada
- **Organizador como nó da rede**, não só cliente final
- **Brasil-first:** WhatsApp, eventos locais, operação real dos núcleos

## Fluxo ponta a ponta (produto)

Base de telas: [fluxo-telas.md](./fluxo-telas.md) (não definitivo).

1. Cliente escolhe cidade e quando (dia/período ou horário)
2. Aplica filtros; vê mapa/lista com ACIT em destaque; pode favoritar
3. Vê detalhes; define data/evento; monta comodidades (cotação)
4. Envia **solicitação** (sem pagar) → estabelecimento analisa
5. Aprovado → paga no prazo → **reserva confirmada**; ou recusa/fila/outras opções
6. Se indisponível, alternativas de parceiros verificados
7. (Opcional) outros locais via Google, sem reserva na plataforma

## Fases (mapa de produto)

| Fase | Foco |
|------|------|
| 0 | Descoberta, piloto **Toledo - PR**, regras ACIT; nome comercial a definir ([nomenclatura.md](./nomenclatura.md)) |
| 1 | Protótipo web responsivo (mock): cadastro visual, agenda, busca, solicitação — [mvp.md](./mvp.md), [stack.md](./stack.md) |
| 2 | Rede de parceria, fila de interesse madura, calendário compartilhado, locação por horário |
| 3 | Pagamento real pós-aprovação, seguro com parceiro, avaliações, Instant Book (se houver) |
| 4 | Escala, métricas, outras cidades |

## Resumo para conversa com clientes

**Em uma frase:** app tipo Airbnb de espaços para eventos, com mapa e agenda em tempo real — o cliente acha local livre na hora, e a rede não perde pedido quando um espaço está ocupado.

**Benefícios:**

| Quem | Ganha |
|------|--------|
| Cliente | Resposta rápida, menos frustração |
| Espaço/núcleo | Menos consulta inútil, lead com data e perfil |
| Organizador | Várias opções na mesma data |
| ACIT | Visibilidade da rede + horas/desistência economizadas |

**Fechamento:** não substitui o WhatsApp no dia a dia — responde primeiro *“está livre no dia X?”* no mapa, para a conversa comercial só começar com interesse real.
