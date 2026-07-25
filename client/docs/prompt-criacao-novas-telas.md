# Prompt para criação de novas telas

Use este prompt para solicitar a implementação de uma nova tela no projeto. Em cada uso, altere somente o bloco **Dados da nova tela**.

> Este modelo considera como referência o padrão visual, estrutural e comportamental já existente no projeto, especialmente os CRUDs de `src/app/features`. Caso a nova tela não seja um CRUD, o agente deve preservar o design system e adaptar apenas o fluxo necessário.

---

## Prompt

```text
Implemente uma nova tela completa neste projeto com base nos dados fornecidos abaixo.

## Dados da nova tela

Nome da tela: [NOME DA TELA]

Campos e regras:
- [NOME DO CAMPO]: [TIPO, OBRIGATORIEDADE, TAMANHO, VALIDAÇÕES, MÁSCARA, VALOR PADRÃO E OUTRAS REGRAS]
- [NOME DO CAMPO]: [TIPO, OBRIGATORIEDADE, TAMANHO, VALIDAÇÕES, MÁSCARA, VALOR PADRÃO E OUTRAS REGRAS]

## Objetivo

Crie a funcionalidade completa e pronta para uso, respeitando a arquitetura, os padrões de código, o layout, a responsividade, a acessibilidade e as convenções já adotadas no repositório.

Antes de alterar arquivos:

1. Leia as instruções locais do repositório, caso existam.
2. Analise a estrutura atual e identifique a feature mais parecida com a tela solicitada.
3. Use os componentes compartilhados e os padrões existentes como fonte principal de verdade.
4. Verifique os contratos reais da API, models, rotas, navegação e serviços disponíveis. Não invente contratos quando eles puderem ser descobertos no projeto.
5. Preserve alterações existentes do usuário e limite as mudanças ao escopo desta tela.

## Padrões obrigatórios do projeto

- Usar Angular standalone e os recursos compatíveis com a versão instalada no projeto.
- Usar `ChangeDetectionStrategy.OnPush`.
- Usar Reactive Forms para formulários.
- Usar `signals` para estado local de interface e serviços para acesso à API.
- Encerrar subscriptions com `takeUntilDestroyed` quando necessário.
- Reutilizar componentes de `src/app/core/components`, como:
  - `AppListPageShellComponent`;
  - `AppDataTableToolbarComponent`;
  - `AppDataTableComponent`;
  - `AppFormShellComponent`;
  - `AppPageHeaderComponent`.
- Reutilizar os helpers, validators, models e serviços existentes antes de criar duplicações.
- Usar Angular Material e os estilos globais/compartilhados já existentes.
- Não adicionar bibliotecas sem necessidade e sem autorização.
- Manter textos visíveis ao usuário em português do Brasil, com acentuação correta.
- Manter nomes de código, tipos, propriedades e arquivos em inglês, seguindo as convenções existentes.
- Garantir tipagem estrita; não usar `any`.
- Não deixar logs de depuração, mocks, TODOs ou código morto.

## Estrutura esperada

Quando a tela for um CRUD, implemente conforme aplicável:

- feature em `src/app/features/[FeatureName]`;
- models/DTOs e requests tipados;
- service com operações necessárias da API;
- arquivo de rotas com lazy loading;
- página de listagem;
- formulário ou diálogo para criar e editar;
- tipos de entrada e resultado do diálogo, se houver;
- inclusão da rota em `src/app/app.routes.ts`;
- inclusão na navegação em `src/app/core/navigation/navigation.config.ts`, quando fizer parte do menu;
- estilos específicos mínimos, reutilizando estilos compartilhados;
- testes relevantes no padrão existente do projeto.

Não crie arquivos ou camadas sem utilidade para os requisitos informados.

## Comportamento da listagem

Se houver listagem:

- exibir no cabeçalho título, subtítulo, ícone e breadcrumbs coerentes;
- disponibilizar ação para criar um registro;
- permitir pesquisa, atualização, paginação e ordenação conforme o suporte da API e o padrão existente;
- criar colunas adequadas aos campos informados;
- exibir estado de carregamento, lista vazia e erro;
- oferecer as ações de linha exigidas pelo fluxo, como editar;
- manter labels, mensagens, tooltips e `aria-labels` coerentes com o nome da entidade;
- preservar responsividade em desktop, tablet e celular.

## Comportamento do formulário

Se houver criação ou edição:

- implementar todos os campos e regras fornecidos;
- marcar campos obrigatórios de forma visual e acessível;
- aplicar `trim` em campos textuais quando fizer sentido;
- usar `nonBlankValidator` para textos obrigatórios que não aceitem somente espaços;
- mostrar mensagens específicas para cada erro de validação;
- usar máscara, contador de caracteres, autocomplete e controles Material adequados ao tipo do campo;
- impedir envio duplicado durante o salvamento;
- marcar todos os campos como tocados ao tentar salvar;
- não chamar a API enquanto o formulário estiver inválido;
- desabilitar o fechamento durante o salvamento, quando for um diálogo;
- mostrar indicador de carregamento;
- tratar erros da API com `getApiErrorMessage`;
- exibir sucesso ou erro com `NotificationService`;
- fechar ou redirecionar somente após sucesso;
- preencher corretamente os valores no modo de edição;
- respeitar valores padrão e diferenças entre criação e edição.

## Integração com API

- Siga o padrão real de `environment.apiBaseUrl`, `ApiResponse`, `unwrapApiData` e tratamento de erros existente.
- Codifique IDs usados em URLs com `encodeURIComponent`.
- Faça o mapeamento explícito entre DTO da API, model da tela e requests.
- Não presuma paginação local ou remota: confirme o comportamento existente e o contrato disponível.
- Não altere silenciosamente nomes ou tipos de propriedades definidos pelo backend.
- Se uma informação indispensável da API não puder ser encontrada, implemente apenas o que for seguro e informe objetivamente a pendência.

## Qualidade visual e acessibilidade

- A nova tela deve parecer parte nativa do sistema, mantendo espaçamento, tipografia, cores, ícones, densidade e hierarquia visual existentes.
- Não replique componentes compartilhados com HTML/CSS próprio.
- Use elementos semânticos, labels associados, foco inicial coerente e navegação por teclado.
- Mensagens de erro devem usar `role="alert"` quando apropriado.
- Botões apenas com ícone devem possuir tooltip e nome acessível.
- Não introduza overflow horizontal desnecessário nem quebre o layout em telas menores.

## Decisões na ausência de detalhes

- Para decisões pequenas, adote o padrão da feature mais semelhante.
- Para decisões que alterem regra de negócio, contrato da API, permissão, exclusão de dados ou fluxo principal, não invente: registre a pendência ou solicite esclarecimento.
- Se não forem informados ícone, subtítulo, rota, endpoint ou permissão, derive-os das convenções do projeto somente quando a correspondência for inequívoca.

## Validação antes da entrega

1. Formate os arquivos alterados conforme a configuração do projeto.
2. Execute o build.
3. Execute os testes relevantes, se existirem.
4. Corrija erros introduzidos pela implementação.
5. Revise imports, tipagem, textos, acentuação e responsividade.
6. Quando o ambiente permitir, abra a tela e valide visualmente os estados de carregamento, vazio, erro, criação, edição e validação do formulário.

## Entrega

Ao concluir:

- apresente um resumo curto do que foi implementado;
- liste os principais arquivos criados ou alterados;
- informe as verificações executadas e seus resultados;
- destaque somente pendências reais, decisões assumidas ou limitações externas;
- não afirme que algo foi validado se não tiver sido executado.
```

---

## Exemplo de preenchimento

```text
Nome da tela: Tipos de documento

Campos e regras:
- Nome: texto obrigatório, não aceitar somente espaços, máximo de 100 caracteres.
- Sigla: texto obrigatório, máximo de 10 caracteres, converter para maiúsculas.
- Exige validade: booleano, valor padrão falso.
- Ativo: booleano, valor padrão verdadeiro; editável somente na edição.
```

Para uma tela que não seja CRUD, descreva nos campos e regras as ações e os comportamentos necessários. Exemplo: `Período: intervalo de datas obrigatório; a data final não pode ser anterior à inicial` ou `Gerar relatório: botão habilitado somente quando os filtros forem válidos`.
