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
