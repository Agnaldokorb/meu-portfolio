# Portfólio Pessoal | Agnaldo Korb

Portfólio pessoal desenvolvido para apresentar minha trajetória profissional,
formações, projetos publicados no GitHub e canais de contato.

O site foi construído com HTML, CSS e JavaScript puro. Os dados do perfil e dos
repositórios são carregados dinamicamente pela API pública do GitHub.

## Funcionalidades

- Apresentação do perfil público do GitHub na página inicial.
- Seção de formações em andamento e concluídas.
- Exibição dos três repositórios atualizados mais recentemente.
- Listagem de até 100 repositórios públicos do perfil `AgnaldoKorb`.
- Modal com o conteúdo do `README.md` de cada projeto.
- Links para o repositório e para a demonstração web, quando disponível.
- Formulário de contato por e-mail ou WhatsApp.
- Menu responsivo com versão hambúrguer para dispositivos móveis.
- Destaque automático da página ativa no menu.
- Estados de carregamento e mensagens de erro para as requisições ao GitHub.
- Navegação por teclado e atributos básicos de acessibilidade.

## Páginas

| Página | Descrição |
| --- | --- |
| `index.html` | Perfil, apresentação e formações. |
| `pages/projetos.html` | Cards dos projetos recentes e lista de repositórios públicos. |
| `pages/sobre.html` | Minha apresentação, trajetória e objetivo profissional. |
| `pages/contato.html` | Formulário de contato por e-mail ou WhatsApp. |

## Tecnologias

- HTML5
- CSS3
- JavaScript
- GitHub REST API
- GitHub Markdown API
- WhatsApp `wa.me`
- Protocolo `mailto:`

O projeto não utiliza framework, gerenciador de pacotes ou etapa de build.

## Integração com o GitHub

O arquivo `js/api.js` consulta o usuário `AgnaldoKorb` para:

- carregar foto, nome e biografia do perfil;
- buscar repositórios públicos ordenados pela atualização mais recente;
- renderizar os três projetos mais recentes em cards;
- montar uma lista com até 100 projetos;
- buscar e renderizar o `README.md` dos repositórios dentro de um modal.

As imagens dos projetos seguem a convenção:

```text
assets/<nome-do-repositorio>.png
```

Quando uma imagem não é encontrada, o site utiliza
`assets/error-image.jpg`.

Como as requisições usam a API pública sem autenticação, elas estão sujeitas
aos limites de acesso definidos pelo GitHub.

## Contato

O formulário permite escolher entre dois canais:

- **E-mail:** abre o cliente de e-mail padrão com a mensagem preenchida.
- **WhatsApp:** abre uma conversa com a mensagem pronta para envio.

Os dados de contato estão definidos no início de `js/contact.js`:

```js
const CONTACT_EMAIL = "contato@agnaldo.dev.br";
const WHATSAPP_NUMBER = "5547999253962";
```

Atualmente, o formulário não utiliza banco de dados nem uma API própria e não
armazena as mensagens enviadas.

## Estrutura do projeto

```text
novo-projeto/
├── assets/
│   ├── dio-bootcamp.webp
│   ├── engenharia-software.png
│   ├── error-image.jpg
│   ├── logo-senai.svg
│   └── skillmatch-js.png
├── css/
│   ├── contact.css
│   ├── footer.css
│   ├── index.css
│   ├── menu.css
│   ├── projetos.css
│   └── sobre.css
├── js/
│   ├── api.js
│   ├── contact.js
│   ├── home.js
│   └── menu.js
├── pages/
│   ├── contato.html
│   ├── projetos.html
│   └── sobre.html
├── index.html
└── README.md
```

## Como executar localmente

Não é necessário instalar dependências. Para evitar restrições do navegador em
requisições feitas por arquivos locais, execute o projeto com um servidor
estático.

### Opção 1: Live Server

1. Abra a pasta do projeto no Visual Studio Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `index.html`.
4. Selecione **Open with Live Server**.

### Opção 2: Node.js

Com Node.js instalado, execute na raiz do projeto:

```bash
npx serve .
```

Depois, abra no navegador o endereço informado no terminal.

## Personalização

- Altere o usuário do GitHub em `GITHUB_USERNAME`, dentro de `js/api.js`.
- Atualize e-mail e WhatsApp em `js/contact.js`.
- Edite as formações diretamente em `index.html`.
- Atualize a apresentação pessoal em `pages/sobre.html`.
- Adicione imagens dos repositórios na pasta `assets/`.
- Ajuste cores, espaçamentos e responsividade nos arquivos da pasta `css/`.

## Responsividade e acessibilidade

O layout adapta cards, formulários, modal e navegação para telas menores. Em
dispositivos móveis, o menu principal é substituído por um botão hambúrguer.

O projeto também inclui:

- textos alternativos em imagens;
- indicação da página atual com `aria-current`;
- controles com `aria-label` e `aria-expanded`;
- mensagens de status com `aria-live`;
- suporte às teclas `Enter`, `Espaço` e `Escape` em elementos interativos.

## Autor

**Agnaldo Korb**

- GitHub: [github.com/AgnaldoKorb](https://github.com/AgnaldoKorb)
- E-mail: [contato@agnaldo.dev.br](mailto:contato@agnaldo.dev.br)
