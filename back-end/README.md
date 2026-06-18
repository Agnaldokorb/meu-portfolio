# API Portfolio GitHub

API em Next.js App Router para sincronizar os repositorios publicos do GitHub de `Agnaldokorb` com MySQL e expor os dados em JSON para o portfolio estatico.

## Tecnologias

- Node.js LTS
- Next.js App Router
- TypeScript strict
- MySQL
- mysql2/promise
- Zod para validacao das variaveis de ambiente

## Estrutura

```text
src/
  app/
    api/
      github-webhook/route.ts
      health/route.ts
      repositories/route.ts
      sync-github/route.ts
  lib/
    date.ts
    db.ts
    env.ts
    github.ts
    http.ts
    repositories.ts
    sync.ts
    webhook.ts
  types/
    repository.ts
database/
  schema.sql
.env.example
```

## Instalacao

```bash
npm install
```

## Configuracao

Crie um arquivo `.env.local` localmente com base em `.env.example`.

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=portfolio

GITHUB_USERNAME=Agnaldokorb
GITHUB_TOKEN=
GITHUB_WEBHOOK_SECRET=

CORS_ORIGIN=https://agnaldo.dev.br
```

`GITHUB_TOKEN` e opcional para repositorios publicos, mas recomendado para evitar limite baixo da API publica. Nunca use `NEXT_PUBLIC_GITHUB_TOKEN`.

## Banco de dados

Execute o SQL em `database/schema.sql` no banco MySQL:

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

## Como rodar

```bash
npm run dev
```

Rotas principais:

- `GET /api/health`
- `GET /api/sync-github`
- `GET /api/repositories`
- `POST /api/github-webhook`

## Sincronizacao

Para carregar ou atualizar o banco:

```bash
curl http://localhost:3000/api/sync-github
```

Resposta esperada:

```json
{
  "message": "Repositórios sincronizados com sucesso",
  "total": 10
}
```

## Consumo do front-end

O portfolio estatico consome:

```text
https://api.agnaldo.dev.br/api/repositories
```

A rota retorna apenas dados do MySQL, ordenados por `ultimo_commit_data` em ordem decrescente.

## Webhook do GitHub

Configure um webhook no GitHub apontando para:

```text
https://api.agnaldo.dev.br/api/github-webhook
```

Eventos recomendados:

- `Pushes`
- `Repositories`
- `Create`

Se preencher `GITHUB_WEBHOOK_SECRET`, a API valida o header `X-Hub-Signature-256`.

## Seguranca

- O token do GitHub fica somente no servidor.
- A API nao usa `NEXT_PUBLIC_GITHUB_TOKEN`.
- Consultas SQL usam placeholders do `mysql2`.
- Variaveis obrigatorias sao validadas com Zod.
- Respostas de erro nao retornam token, senha ou dados sensiveis.
- O front-end renderiza dados com `textContent`, evitando HTML direto vindo da API.

## Producao

- Criar o banco MySQL e executar `database/schema.sql`.
- Configurar `.env.local` ou variaveis do provedor de deploy.
- Definir `CORS_ORIGIN` para o dominio do portfolio.
- Configurar `GITHUB_TOKEN` com escopo minimo para leitura de repositorios publicos.
- Configurar o webhook do GitHub com `GITHUB_WEBHOOK_SECRET`.
- Rodar `npm run lint`.
- Rodar `npm run build`.
