# Portfolio + API de Sincronizacao GitHub

Projeto completo com:

- Front-end em HTML, CSS e JavaScript puro na raiz do repositorio.
- API em Next.js + TypeScript + Prisma dentro da pasta back-end.
- Persistencia em PostgreSQL (Supabase).

## Objetivo

Sincronizar os repositorios publicos do usuario GitHub Agnaldokorb com o banco de dados e disponibilizar os dados por JSON para consumo do front-end.

## Tecnologias

Front-end:

- HTML5
- CSS3
- JavaScript

Back-end (pasta back-end):

- Node.js LTS
- Next.js (App Router)
- TypeScript
- Prisma ORM
- Supabase (PostgreSQL)
- GitHub REST API

## Estrutura

- Front-end: raiz do projeto (paginas, css, js, assets)
- API: back-end/src/app/api
- Camada de banco: back-end/src/lib/db.ts
- Camada GitHub: back-end/src/lib/github.ts
- Camada repositories: back-end/src/lib/repositories.ts
- Tipos: back-end/src/types/repository.ts
- SQL: back-end/sql/create_repositories_table.sql

## Instalar dependencias

Na pasta do back-end:

```bash
cd back-end
npm install
```

## Configurar ambiente (.env.local)

Crie back-end/.env.local com:

```env
DATABASE_URL=""
DIRECT_URL=""

GITHUB_USERNAME=Agnaldokorb
GITHUB_TOKEN=
GITHUB_WEBHOOK_SECRET=
```

Observacoes:

- Use credenciais do banco PostgreSQL do Supabase.
- Nunca exponha GITHUB_TOKEN no front-end.
- Nunca use NEXT_PUBLIC_GITHUB_TOKEN.

## SQL da tabela repositories

Use o script abaixo (tambem disponivel em back-end/sql/create_repositories_table.sql):

```sql
CREATE TABLE IF NOT EXISTS repositories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  url_github VARCHAR(500) NOT NULL,
  url_website VARCHAR(500),
  descricao TEXT,
  readme_md LONGTEXT,
  ultimo_commit_sha VARCHAR(100),
  ultimo_commit_msg TEXT,
  ultimo_commit_data DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Prisma

Gerar client e sincronizar schema:

```bash
cd back-end
npm run prisma:generate
npm run prisma:push
```

## Rodar o projeto

Back-end:

```bash
cd back-end
npm run dev
```

Por padrao, a API local fica em:

```txt
http://localhost:3000
```

Front-end:

- Servir a raiz com servidor estatico (exemplo: Live Server).
- O front ja esta preparado para consumir https://api.agnaldo.dev.br/api/repositories.
- Para ambiente local, voce pode definir window.PORTFOLIO_API_BASE_URL antes de carregar js/api.js.

## Rotas da API

Health check:

```txt
GET /api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "message": "API funcionando"
}
```

Sincronizar GitHub com banco:

```txt
GET /api/sync-github
```

Comportamento:

- Le GITHUB_USERNAME e GITHUB_TOKEN do ambiente.
- Busca repositorios no endpoint GitHub com sort=updated e per_page=999.
- Busca README e ultimo commit de cada repositorio.
- Salva ou atualiza no banco usando ON DUPLICATE KEY UPDATE.

Resposta de sucesso:

```json
{
  "message": "Repositórios sincronizados com sucesso",
  "total": 10
}
```

Listar repositorios do banco:

```txt
GET /api/repositories
```

Comportamento:

- Busca somente no banco de dados.
- Ordena por ultimo_commit_data desc.
- Retorna JSON para consumo do front-end.

## Webhook GitHub (atualizacao continua)

Rota criada:

```txt
POST /api/github-webhook
```

Uso recomendado:

- Configure no GitHub Webhooks para eventos push e repository.
- Defina GITHUB_WEBHOOK_SECRET no ambiente.
- Envie o mesmo secret no webhook do GitHub.

Ao receber evento valido, a API atualiza o repositorio afetado no banco.

## Consumo no front-end

A pagina pages/projetos.html ja consome /api/repositories e exibe:

- Imagem (assets)
- Nome
- Descricao
- Link GitHub
- Link Website (quando existir)
- Data do ultimo commit
- Estados de carregamento e erro
- Botao de recarregar dados

## Seguranca

- Token GitHub apenas no servidor.
- Sem exposicao de segredo no navegador.
- Validacao de variaveis obrigatorias no endpoint de sync.
- Tratamento de erros da API GitHub e banco com mensagens amigaveis.

## Comandos uteis

```bash
cd back-end
npm run dev
npm run typecheck
npm run lint
npm run prisma:generate
npm run prisma:push
```
