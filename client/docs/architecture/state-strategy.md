# Estratégia de Estado do Sistema

## Objetivo
Definir quando usar `signals`, quando usar serviços e quando vale trazer NgRx para o sistema.

## Regra prática
- Estado simples e local: `signals` ou serviço.
- Estado local mais estruturado: `NgRx Signal Store`.
- Estado global e complexo: `@ngrx/store` com `@ngrx/effects`.

## 1. O que fica em `signals`
Use `signals` para estado de interface e interação imediata, quando o valor vive dentro de uma tela ou componente.

Casos típicos:
- sidebar recolhida/expandida;
- drawer mobile aberto/fechado;
- estado de loading visual;
- filtros locais de uma página;
- seleção temporária de itens;
- título, breadcrumb e contexto da página;
- flags simples de UI.

Critério:
Se o estado não precisa ser compartilhado entre várias áreas da aplicação, `signals` são a escolha mais leve e legível.

## 2. O que vai para serviços
Use serviços para regras de domínio leves, comunicação com API e coordenação entre componentes.

Casos típicos:
- chamadas `HttpClient`;
- autenticação e sessão, quando o fluxo for simples;
- cache simples de dados;
- transformação de resposta da API;
- regras reutilizáveis entre telas;
- composição de requests, headers e parâmetros.

Critério:
O serviço continua sendo o lugar para buscar e salvar dados. O estado pode até viver no serviço, mas sem virar um fluxo global pesado.

## 3. O que eventualmente vai para NgRx
Use NgRx quando houver estado global, fluxo assíncrono relevante e necessidade forte de previsibilidade.

Casos típicos:
- autenticação global;
- permissões e perfil do usuário;
- entidades compartilhadas entre muitas telas;
- listas grandes com cache e sincronização;
- paginação e filtros compartilhados;
- notificações globais;
- histórico de navegação relevante ao domínio;
- cenários com múltiplos efeitos concorrentes.

### Sugestão de adoção
- `@ngrx/signals`: primeiro passo para estado estruturado, mas ainda próximo da mentalidade atual;
- `@ngrx/store` + `@ngrx/effects`: quando o estado deixar de ser local e passar a ser realmente global;
- `@ngrx/entity`: quando houver coleções grandes e normalizadas, como membros, famílias e eventos;
- `@ngrx/router-store`: apenas se a navegação precisar participar do estado de domínio;
- `@ngrx/store-devtools`: recomendado quando o Store for adotado.

## Diretriz para este projeto
Hoje o projeto está mais alinhado com `signals` + serviços do que com um store global completo.

Isso significa:
- o shell e a UI ficam em `signals`;
- a camada de acesso a dados fica em serviços;
- NgRx entra depois, apenas nas áreas que realmente exigirem estado global e orquestração mais pesada.

## Conclusão
A arquitetura mais vantajosa agora é:
1. `signals` para estado local e de UI;
2. serviços para acesso a dados e regras reutilizáveis;
3. NgRx apenas quando o domínio crescer a ponto de justificar estado global, efeitos e cache centralizado.
