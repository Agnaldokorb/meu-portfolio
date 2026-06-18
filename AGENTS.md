<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# AGENTS.md — Instruções para Agente de IA no VSCode

## Papel do agente

Você é um agente de desenvolvimento full-stack especialista em:

* Node.js
* Next.js
* TypeScript
* JavaScript
* Supabase
* Prisma ORM
* API REST
* GitHub REST API
* HTML, CSS e JavaScript puro

Seu dever é criar uma aplicação completa onde:

1. A API busca dados do GitHub do usuário `Agnaldokorb`.
2. A API salva e atualiza esses dados em um banco Supabase.
3. O front-end em HTML, CSS e JavaScript puro consome a API.
4. A API retorna os dados em formato JSON.
5. crie toda a logica da api dentro da pasta `back-end` 
6. criar uma atualização constante do banco de dados com a webhook do github, para cada novo repositorio e novo commit atualizar o banco de dados

Sempre siga este arquivo `AGENTS.md` como fonte principal de instruções antes de criar, editar ou remover qualquer arquivo.

---

## Objetivo do projeto

Criar uma API com Node.js, Next.js, Supabase e TypeScript para sincronizar repositórios públicos do GitHub com um banco de dados MySQL.

A aplicação deve:

* Buscar todos os repositórios públicos do GitHub.
* Salvar cada repositório no banco Supabase.
* Atualizar repositórios já existentes.
* Buscar o README.md principal de cada repositório.
* Buscar informações do último commit.
* Identificar novos commits.
* Identificar novos repositórios.
* Disponibilizar uma rota JSON para o front-end consumir.
* Permitir que um front-end feito em HTML, CSS e JavaScript puro consuma os dados do banco.

GitHub usado como fonte:

```txt
https://github.com/Agnaldokorb
```

Usuário GitHub:

```txt
Agnaldokorb
```

---

## Stack obrigatória

Use obrigatoriamente:

* Node.js LTS
* Next.js com App Router
* TypeScript
* JavaScript
* Supabase
* prisma ORM
* HTML
* CSS
* JavaScript puro no front-end

usar Supabase neste projeto.

usar Prisma neste projeto.

Não usar MongoDB ou outro DB a nao ser que seja solicitado.

---

## Estrutura esperada do projeto

Crie uma estrutura parecida com esta:

```txt
src/
  app/
    api/
      repositories/
        route.ts
      sync-github/
        route.ts
      health/
        route.ts
  lib/
    db.ts
    github.ts
    repositories.ts
  types/
    repository.ts
public/
  index.html
  css/
    style.css
  js/
    app.js
.env.example
```

---

## Variáveis de ambiente

Crie um arquivo `.env.example` com:

```env
DATABASE_URL=""
DIRECT_URL=""

GITHUB_USERNAME=Agnaldokorb
GITHUB_TOKEN=
```

Nunca criar ou preencher `.env.local` com dados reais.

Nunca expor `GITHUB_TOKEN` no front-end.

Nunca usar `NEXT_PUBLIC_GITHUB_TOKEN`.

---

## Banco de dados MySQL

Crie o SQL da tabela `repositories`.

A tabela deve guardar:

* id
* github_id
* nome
* url do repositório GitHub
* url do website, quando existir
* descrição
* README.md principal
* último commit SHA
* mensagem do último commit
* data do último commit
* data de criação
* data de atualização

SQL obrigatório:

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

---

## Rotas obrigatórias da API

### 1. Health check

Criar rota:

```txt
GET /api/health
```

Retorno esperado quando estiver tudo ok:

```json
{
  "status": "ok",
  "message": "API funcionando"
}
```

---

### 2. Sincronizar GitHub com supabase

Criar rota:

```txt
GET /api/sync-github
```

Essa rota deve:

1. Ler `GITHUB_USERNAME` do `.env`.
2. Ler `GITHUB_TOKEN` do `.env`.
3. Buscar repositórios públicos em:

```txt
https://api.github.com/users/Agnaldokorb/repos?sort=updated&per_page=999
```

4. Para cada repositório, buscar o README principal.
5. Para cada repositório, buscar o último commit.
6. Salvar no supabase.
7. Se o repositório já existir, atualizar os dados.
8. Retornar JSON com total de repositórios sincronizados.

Retorno esperado:

```json
{
  "message": "Repositórios sincronizados com sucesso",
  "total": 10
}
```

---

### 3. Listar repositórios do banco

Criar rota:

```txt
GET /api/repositories
```

Essa rota deve:

1. Buscar dados somente no banco MySQL.
2. Não buscar dados diretamente do GitHub.
3. Ordenar por `ultimo_commit_data` em ordem decrescente.
4. Retornar JSON.

Exemplo de retorno:

```json
[
  {
    "id": 1,
    "github_id": 123456,
    "nome": "portfolio",
    "url_github": "https://github.com/Agnaldokorb/portfolio",
    "url_website": "https://exemplo.com",
    "descricao": "Meu portfólio",
    "readme_md": "# Portfolio",
    "ultimo_commit_sha": "abc123",
    "ultimo_commit_msg": "feat: update layout",
    "ultimo_commit_data": "2026-06-18T10:00:00.000Z"
  }
]
```

---

## Camada de banco

Criar arquivo:

```txt
src/lib/db.ts
```

Responsabilidades:

* Criar conexão com supabase usando prisma orm
* Usar pool de conexões.
* Ler dados do `.env`.
* Exportar a conexão para uso nas rotas.

---

## Camada GitHub

Criar arquivo:

```txt
src/lib/github.ts
```

Responsabilidades:

* Buscar repositórios públicos.
* Buscar README.md principal.
* Buscar último commit.
* Tratar erro da API do GitHub.
* Usar `GITHUB_TOKEN` somente no servidor.
* Não quebrar a sincronização se um repositório não tiver README.

---

## Camada repositories

Criar arquivo:

```txt
src/lib/repositories.ts
```

Responsabilidades:

* Salvar repositório no banco.
* Atualizar repositório já existente.
* Listar repositórios do banco.
* Usar `INSERT ... ON DUPLICATE KEY UPDATE`.

---

## Front-end puro

front-end já criado dentro de `../meu-portfolio/`.

Arquivos:

```txt
index.html
README.md
assets/dio-bootcanp.webp
  engenharia-software.png
  error-image.jpg
  logo-senai.svg
  skillmatch.png
  (sera adicionado mais imagens futuramente so mantenha a estrutura e a logica atual de coleta de imagens daqui)
css/contact.css
  footer.css
  index.css
  menu.css
  projetos.css
  sobre.css
js/api.js
  contact.js
  home.js
  menu.js
pages/contato.html
  projetos.html
  sobre.html
```

O front-end deve:

* Consumir `/api/repositories` via link `https://api.agnaldo.dev.br`.
* Exibir os repositórios em cards `pages/projetos.html`.
* Mostrar:

  * imagem `assets/`
  * Nome
  * Descrição
  * Link GitHub
  * Link Website, "se existir"
  * Data do último commit
* Mostrar mensagem de carregamento.
* Mostrar mensagem de erro.
* Ter botão para recarregar dados.
* Usar HTML, CSS e JavaScript puro.
* Não usar React no front-end público deste exemplo.
* mater a estrutura atual somente adicionar oque nao tem ainda

---

## Regras de segurança

* Nunca expor `GITHUB_TOKEN` no navegador.
* Nunca criar token diretamente no código.
* Nunca usar `NEXT_PUBLIC_GITHUB_TOKEN`.
* Sempre usar variáveis de ambiente.
* Validar se as variáveis obrigatórias existem.
* Tratar erros da API.
* Tratar erros do banco.
* Retornar mensagens amigáveis em JSON.
* Não retornar dados sensíveis.

---

## Qualidade do código

O agente deve:

* Criar código limpo.
* Usar TypeScript.
* Criar tipos para repositórios.
* Evitar duplicação de código.
* Separar responsabilidades.
* Escrever funções pequenas.
* Comentar somente onde for necessário.
* Usar nomes claros em português ou inglês, mantendo padrão consistente.
* Não misturar regra de negócio dentro da rota quando puder separar em `lib`.
* não expor o AGENTS.md e CLAUDE.md no repositorio.

---

## Tipos esperados

Criar arquivo:

```txt
src/types/repository.ts
```

Com tipos para:

* GitHubRepository
* GitHubCommit
* RepositoryRecord

---

## README.md

Criar um README com:

* Nome do projeto
* Objetivo
* Tecnologias
* Como instalar
* Como configurar `.env.local`
* SQL da tabela
* Como rodar o projeto
* Como sincronizar GitHub
* Como consumir `/api/repositories`
* Observações de segurança

---

## Ordem de execução do agente

O agente deve trabalhar nesta ordem:

1. Ler completamente este `AGENTS.md`.
2. Criar estrutura de pastas.
3. Criar `.env.example`.
4. Criar SQL da tabela.
5. Criar conexão MySQL.
6. Criar tipos TypeScript.
7. Criar camada GitHub.
8. Criar camada repositories.
9. Criar rotas da API.
10. Criar front-end HTML/CSS/JS puro.
11. Criar README.
12. Revisar se tudo segue este arquivo.

---

## Critérios de aceite

A tarefa só estará concluída quando:

* `/api/health` funcionar perfeitamente.
* `/api/sync-github` buscar dados do GitHub e salvar no supabase.
* `/api/repositories` retornar JSON vindo do banco co o sitado acima de exemplo.
* O front-end `index.html` exibir os dados.
* O README explicar como rodar.
* O token GitHub não estiver exposto.
* O projeto estiver organizado e com TypeScript.

---

## Instrução final para o agente

Ao implementar, não invente outra arquitetura sem necessidade.

Siga exatamente este `AGENTS.md`.

Sempre que houver dúvida, consulte novamente este arquivo antes de alterar o código.

caso nao saiba como fazer consulte a documentação:
github: https://docs.github.com/pt/rest?apiVersion=2026-03-10
supabase: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
prisma: https://www.prisma.io/docs
