# Espacos

## Objetivo

Definir o cadastro e a exibicao dos locais anunciados na plataforma.

## Cadastro

O parceiro pode cadastrar um espaco de duas formas:

- fluxo assistido por Google Places mock;
- fluxo manual.

O cadastro real ainda depende de backend, persistencia e validacao fora do `localStorage`.

## Conteudo minimo do perfil

- nome;
- endereco;
- cidade/estado;
- capacidade;
- area locavel;
- modalidades de locacao;
- preco base;
- fotos;
- tipos de evento;
- classes do espaco;
- infraestrutura;
- comodidades;
- regras;
- contato.

## Comodidades

As comodidades usam o catalogo documentado em [`comodidades.md`](./comodidades.md). No perfil elas aparecem como vitrine; no pedido elas viram itens selecionaveis com total estimado.

## Verificacao

O papel de organizador foi removido. A verificacao passa a ser atributo da plataforma/rede, sem painel dedicado de organizador.

## Fora do MVP inicial

- validacao juridica real;
- comprovantes/documentos reais;
- moderacao profissional de fotos;
- integracao real com Google Places;
- backend de homologacao/verificacao.

## Estado da implementacao

- Perfis mock em `src/lib/mock-data.ts`.
- Detalhe do espaco no mapa em `SpaceDetailPanel`.
- Galeria com lightbox.
- Cadastro do espaco no painel do parceiro em `SpaceRegistrationWizard`.
- Publicacoes locais em `src/lib/space-registration.ts`.
- `/painel-acit` e o painel de organizador foram removidos.
