# Usuários e papéis

## Papéis

| Papel | Descrição | Necessidade principal |
|-------|-----------|------------------------|
| **Cliente final** | Quem precisa do espaço para o evento | Achar local livre rápido |
| **Espaço / núcleo** | Estabelecimento ou núcleo ACIT que oferece o local | Menos consulta inútil, mais reserva |
| **Organizador parceiro** | Profissional que monta eventos para clientes | Ver vários espaços e encaminhar opções |
| **ACIT (rede)** | Entidade que ancora e governa a rede | Visibilidade setorial e eficiência |

## Responsabilidades (produto)

### Cliente final
- Buscar por cidade, data/período/horário, filtros
- Favoritar espaços
- Enviar solicitação (com cotação de comodidades) e acompanhar status
- Pagar somente após aprovação, para confirmar a reserva
- Receber alternativas da rede se o preferido estiver ocupado

### Espaço / núcleo
- Cadastrar o local (assistido via Google Places ou manual) — [cadastro-assistido-google.md](./cadastro-assistido-google.md)
- Completar dados de locação: área, modalidades dia/hora, janelas, tomadas, pets, comodidades, fotos
- Manter agenda confiável
- Analisar solicitações (aprovar/recusar) dentro do prazo
- Confirmar reservas após pagamento do cliente

### Organizador parceiro
- Vincular-se a espaços da rede
- Montar listas de opções por data
- Encaminhar propostas ao cliente final

### ACIT
- Homologar parceiros / selo da rede
- Definir padrões mínimos de cadastro e atualização de agenda
- Acompanhar métricas de impacto

## Estado da implementação

- Contas mock em `src/lib/mock-session.ts`: **cliente** (Ana) e **parceiro ACIT** (Marcos — Vila Verde + Salão das Corujas).
- Login/cadastro mock em `/entrar`; home do parceiro = `/painel` (agenda, solicitações, anúncios).
- Organizador parceiro (papel intermediário) ainda não.
