# memory-bridge

Memory Bridge transforma contexto do projeto em arquivos versionados e legiveis por humanos. Harnesses de agentes mudam; `.memory/` permanece no repositorio, viaja pelo Git e continua auditavel.

Store canonico:

```text
.memory/
├── entries/              # memorias explicitas, markdown com frontmatter
├── decisions/            # espelho opcional de ADRs
├── conventions.md        # convencoes mantidas por humanos
├── context.md            # contexto ausente do codigo-fonte
├── preferences.md        # preferencias de usuario/time
└── index.json            # indice de metadados pesquisavel
```

`index.json` registra `id`, tipo, tags, resumo, timestamps, origem e caminho markdown. Markdown continua sendo conteudo canonico e legivel. Sem nuvem, embeddings, banco vetorial ou captura automatica.

## Instalacao

```bash
cd memory-bridge
npm install
npm run build
npm link
```

Adicione plugin na configuracao do OpenCode:

```json
{ "plugin": ["file:///absolute/path/to/memory-bridge/dist/index.js"] }
```

## Uso via CLI

```bash
memory-bridge add "Este servico nao tem NAT e usa IP publico" --tag infra --tag rede
memory-bridge search NAT
memory-bridge list
memory-bridge sync --to opencode
memory-bridge sync --to antigravity
memory-bridge status
```

`sync --to antigravity` grava `.gemini/memory-bridge.md`. Configure instrucoes de projeto do Antigravity para ler esse arquivo. Arquivo gerado nunca e fonte de verdade: edite `.memory/` e sincronize novamente.

## Uso no OpenCode

Plugin expoe `remember(text, tags?)` e `memory_search(query)`. `remember` grava memoria explicita com `source: opencode`; texto duplicado falha em vez de sobrescrever dados. Plugin injeta memoria do projeto na primeira mensagem da sessao. Nunca armazene senhas, chaves, strings de conexao ou outros segredos em `.memory/`.

## Regras de conflito

Nucleo nunca importa saida gerada pelo Antigravity; conteudo gerado nao pode sobrescrever memoria neutra. `add` duplicado aborta com erro explicito. Adaptadores reversos futuros devem preservar origem e timestamps, avisando sobre conflitos em vez de aplicar ultima escrita silenciosamente.

## Validacao

```bash
npm test
npm run typecheck
npm pack --dry-run
```
