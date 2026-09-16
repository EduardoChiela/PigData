# Fluxo de telas

## Status

Base de UX do prototipo mock. O sistema atual possui dois papeis: cliente e parceiro.

## Fluxo principal do cliente

```text
/bem-vindo (visitante)
  -> busca: O que está planejando? / Onde / Quando
  -> / mapa (sem login)
  -> /espaco/$slug (detalhe tela cheia, nova aba)
  -> Escolher data e solicitar
  -> /entrar (se ainda sem conta)
  -> data/evento → comodidades → revisao → enviada
  -> /minhas-reservas + notificacoes
  -> pagamento demo se aprovado
```

## Fluxo principal do parceiro

```text
/entrar
  -> /painel
  -> Agenda
  -> Solicitacoes
  -> Regras de reserva
  -> Meus anuncios
  -> Cadastrar espaco
```

## Telas

| Tela | Rota/componente | Estado |
|------|-----------------|--------|
| T01 Landing | `/bem-vindo` + `HeroSearchBar` | Implementado |
| T02 Busca/mapa | `/` (público) | Implementado |
| T03 Detalhe | `/espaco/$slug` | Implementado |
| T04 Data/evento | `BookingRequestFlow` | Implementado mock |
| T05 Comodidades | `BookingRequestFlow` | Implementado mock |
| T06 Revisao/envio | `BookingRequestFlow` (exige login) | Implementado mock |
| T07 Acompanhamento | `/minhas-reservas` | Implementado simples |
| T08 Pagamento demo | Sino / `/minhas-reservas` | Implementado simples |
| Painel parceiro | `/painel` | Implementado mock |

## Regras de negocio

- Solicitacao nao e reserva.
- Reserva so confirma apos aprovacao e pagamento demo.
- Solicitatacoes concorrentes podem existir.
- Hold e reserva confirmada bloqueiam o calendario.
- Pendencias aparecem na agenda do parceiro.

## Decisao sobre organizador

O painel e o papel de organizador foram removidos. A plataforma assume a organizacao da rede; no produto ficam apenas cliente e parceiro.

## Fora do prototipo atual

- backend real;
- autentificacao real;
- pagamentos reais;
- Google Places real;
- Google Calendar real;
- e-mail/WhatsApp providers.
