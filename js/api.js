let cardsContainer = document.querySelector("#cards-container");
let listaContainer = document.querySelector("#lista-container");
let userProfileContainer = document.querySelector("#card-user-container");

let GITHUB_USERNAME = "AgnaldoKorb";
let GITHUB_USER_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;
let PORTFOLIO_API_BASE_URL = (
  window.PORTFOLIO_API_BASE_URL ?? "https://api.agnaldo.dev.br"
).replace(/\/$/, "");
let REPOSITORIES_API_URL = `${PORTFOLIO_API_BASE_URL}/api/repositories`;
let CARDS_LIMIT = 3;
let LIST_LIMIT = 9999999;
let IMG_USER = `https://github.com/${GITHUB_USERNAME}.png?size=200`;
let ASSETS_BASE_PATH = window.location.pathname.includes("/pages/")
  ? "../assets"
  : "assets";
let FAILL_IMAGE = `${ASSETS_BASE_PATH}/error-image.jpg`;

class githubRepositories {
  constructor(cardsElement, listElement, userProfileElement) {
    this.cardsElement = cardsElement;
    this.listElement = listElement;
    this.userProfileElement = userProfileElement;
    this.modalOverlay = null;
    this.readmeCache = new Map();
    this.lastFocusedElement = null;
    this.reloadButton = document.querySelector("#reload-repositories");

    if (this.reloadButton) {
      this.reloadButton.addEventListener("click", () => this.init());
    }
  }

  async init() {
    // Executa apenas quando existir ao menos um container para renderizar.
    if (!this.cardsElement && !this.listElement && !this.userProfileElement)
      return;

    this.setLoading();

    try {
      if (this.cardsElement || this.listElement) {
        this.ensureRepositoryModal();
        let repositories = await this.fetchRepositories();
        this.render(repositories);
      }

      if (this.userProfileElement) {
        let profile = await this.fetchUserProfile();
        this.renderUserProfile(profile);
      }
    } catch (error) {
      console.error("Erro ao buscar repositórios:", error);
      this.renderError();
    }
  }

  async fetchRepositories() {
    let response = await fetch(REPOSITORIES_API_URL, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar repositórios: ${response.status}`);
    }

    let data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Resposta inesperada da API do Github");
    }

    return data.map((repository) => this.normalizeRepository(repository));
  }

  normalizeRepository(repository) {
    return {
      id: repository.id,
      github_id: repository.github_id,
      name: repository.nome ?? repository.name,
      html_url: repository.url_github ?? repository.html_url,
      homepage: repository.url_website ?? repository.homepage ?? "",
      description: repository.descricao ?? repository.description,
      readme_md: repository.readme_md ?? "",
      pushed_at:
        repository.ultimo_commit_data ??
        repository.pushed_at ??
        repository.updated_at,
      last_commit_sha: repository.ultimo_commit_sha ?? "",
      last_commit_message: repository.ultimo_commit_msg ?? "",
    };
  }

  async fetchUserProfile() {
    let response = await fetch(GITHUB_USER_API_URL);

    if (!response.ok) {
      throw new Error(`Erro ao buscar perfil do usuário: ${response.status}`);
    }

    return response.json();
  }

  setLoading() {
    if (this.reloadButton) {
      this.reloadButton.disabled = true;
    }

    if (this.cardsElement) {
      this.cardsElement.innerHTML =
        "<p>Carregando cards de repositórios...</p>";
    }
    if (this.listElement) {
      this.listElement.innerHTML = "<p>Carregando lista de repositórios...</p>";
    }
    if (this.userProfileElement) {
      this.userProfileElement.innerHTML = "<p>Carregando perfil...</p>";
    }
  }

  render(repositories) {
    let sortedRepositories = [...repositories].sort(
      (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at),
    );

    let cardRepositories = sortedRepositories.slice(0, CARDS_LIMIT);
    let listRepositories = sortedRepositories.slice(0, LIST_LIMIT);

    if (this.cardsElement) {
      this.cardsElement.replaceChildren(
        ...cardRepositories.map((repository) => this.createCard(repository)),
      );
    }
    if (this.listElement) {
      this.listElement.replaceChildren(
        ...listRepositories.map((repository) =>
          this.createListItem(repository),
        ),
      );
    }

    if (this.reloadButton) {
      this.reloadButton.disabled = false;
    }
  }

  renderUserProfile(profile) {
    if (!this.userProfileElement) return;

    this.userProfileElement.replaceChildren(this.createCardUser(profile));
  }

  renderError() {
    if (this.reloadButton) {
      this.reloadButton.disabled = false;
    }

    if (this.cardsElement) {
      this.cardsElement.textContent =
        "Erro ao carregar os repositórios. Por favor, tente novamente mais tarde.";
    }
    if (this.listElement) {
      this.listElement.textContent =
        "Erro ao carregar os repositórios. Por favor, tente novamente mais tarde.";
    }
    if (this.userProfileElement) {
      this.userProfileElement.textContent =
        "Erro ao carregar o perfil. Por favor, tente novamente mais tarde.";
    }
  }

  createCard(repository) {
    let card = document.createElement("article");
    card.classList.add("card");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      `Abrir detalhes do repositório ${repository.name}`,
    );

    let img = document.createElement("img");
    img.className = "card-image";
    img.src = `${ASSETS_BASE_PATH}/${encodeURIComponent(repository.name)}.png`;
    img.alt = `Imagem do repositório ${repository.name}`;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.src = FAILL_IMAGE;
      img.alt = "Imagem de erro ao carregar";
    });

    let title = document.createElement("h2");
    title.textContent = repository.name;

    let description = document.createElement("p");
    description.textContent =
      repository.description ?? "Sem descrição disponível.";

    let commitDate = document.createElement("p");
    commitDate.className = "repo-date";
    commitDate.textContent = `Último commit: ${this.formatDate(repository.pushed_at)}`;

    card.append(
      img,
      title,
      description,
      commitDate,
      this.createRepositoryActions(repository),
    );
    this.addRepositoryLinkEvent(card, repository.html_url, repository);

    return card;
  }

  createListItem(repository) {
    let item = document.createElement("li");
    item.classList.add("list-item");
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute(
      "aria-label",
      `Abrir detalhes do repositório ${repository.name}`,
    );

    let title = document.createElement("h2");
    title.textContent = repository.name;

    let description = document.createElement("p");
    description.textContent =
      repository.description ?? "Sem descrição disponível.";

    let commitDate = document.createElement("p");
    commitDate.className = "repo-date";
    commitDate.textContent = `Último commit: ${this.formatDate(repository.pushed_at)}`;

    item.append(
      title,
      description,
      commitDate,
      this.createRepositoryActions(repository),
    );
    this.addRepositoryLinkEvent(item, repository.html_url, repository);

    return item;
  }

  createCardUser(profile) {
    let card = document.createElement("article");
    card.classList.add("card-user");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      `Abrir perfil do usuário ${GITHUB_USERNAME}`,
    );

    let img = document.createElement("img");
    img.className = "card-user-image";
    img.src = IMG_USER;
    img.alt = `Imagem do portfólio de ${GITHUB_USERNAME}`;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.src = FAILL_IMAGE;
      img.alt = "Imagem de erro ao carregar";
    });

    let title = document.createElement("h2");
    title.textContent = GITHUB_USERNAME;

    let bio = document.createElement("p");
    bio.textContent = profile.bio ?? "Sem biografia disponível.";

    card.append(img, title, bio);
    this.addRepositoryLinkEvent(card, profile.html_url);

    return card;
  }

  ensureRepositoryModal() {
    if (this.modalOverlay) return;

    let overlay = document.createElement("div");
    overlay.className = "repo-modal-overlay";
    overlay.setAttribute("aria-hidden", "true");

    overlay.innerHTML = `
      <article class="repo-modal" role="dialog" aria-modal="true" aria-labelledby="repo-modal-title">
        <header class="repo-modal-header">
          <h2 id="repo-modal-title">Detalhes do projeto</h2>
          <button type="button" class="repo-modal-close" data-action="close" aria-label="Fechar card de detalhes">Fechar</button>
        </header>
        <p class="repo-modal-subtitle"></p>
        <div class="repo-modal-readme">Carregando README.md...</div>
        <div class="repo-modal-actions">
          <button type="button" class="repo-modal-btn repo-modal-btn-light" data-action="close">Fechar e voltar</button>
          <a class="repo-modal-btn repo-modal-btn-dark" data-action="github" target="_blank" rel="noopener noreferrer">Abrir no GitHub</a>
          <a class="repo-modal-btn repo-modal-btn-primary" data-action="web" target="_blank" rel="noopener noreferrer">Visualizacao web</a>
        </div>
      </article>
    `;

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        this.closeRepositoryModal();
      }
    });

    overlay.querySelectorAll('[data-action="close"]').forEach((button) => {
      button.addEventListener("click", () => this.closeRepositoryModal());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        this.closeRepositoryModal();
      }
    });

    document.body.append(overlay);
    this.modalOverlay = overlay;
  }

  async openRepositoryModal(repository) {
    if (!this.modalOverlay) return;

    let subtitle = this.modalOverlay.querySelector(".repo-modal-subtitle");
    let readmeContent = this.modalOverlay.querySelector(".repo-modal-readme");
    let githubButton = this.modalOverlay.querySelector(
      '[data-action="github"]',
    );
    let webButton = this.modalOverlay.querySelector('[data-action="web"]');

    this.lastFocusedElement = document.activeElement;
    subtitle.textContent = repository.name;
    readmeContent.textContent = "Carregando README.md...";

    githubButton.href = repository.html_url;

    let homepage = (repository.homepage ?? "").trim();
    if (homepage) {
      webButton.hidden = false;
      webButton.href = /^https?:\/\//i.test(homepage)
        ? homepage
        : `https://${homepage}`;
    } else {
      webButton.hidden = true;
      webButton.removeAttribute("href");
    }

    this.modalOverlay.classList.add("is-open");
    this.modalOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("repo-modal-open");

    let cachedPreview = this.readmeCache.get(repository.name);
    if (cachedPreview) {
      readmeContent.innerHTML = cachedPreview;
      return;
    }

    let readme =
      repository.readme_md ||
      "README.md principal nao encontrado para este repositorio.";

    let readmePreview = await this.renderReadmePreview(readme, repository.name);
    this.readmeCache.set(repository.name, readmePreview);
    readmeContent.innerHTML = readmePreview;
  }

  closeRepositoryModal() {
    if (!this.modalOverlay) return;

    this.modalOverlay.classList.remove("is-open");
    this.modalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("repo-modal-open");

    if (
      this.lastFocusedElement &&
      typeof this.lastFocusedElement.focus === "function"
    ) {
      this.lastFocusedElement.focus();
    }
  }

  async renderReadmePreview(readme, repositoryName) {
    try {
      let html = await this.fetchMarkdownPreview(readme, repositoryName);

      if (html) {
        return this.sanitizeHtml(html);
      }
    } catch (error) {
      console.warn("Nao foi possivel renderizar o preview do README:", error);
    }

    let pre = document.createElement("pre");
    pre.textContent = readme;
    return pre.outerHTML;
  }

  async fetchMarkdownPreview(markdown, repositoryName) {
    let response = await fetch("https://api.github.com/markdown", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        text: markdown,
        mode: "gfm",
        context: `${GITHUB_USERNAME}/${repositoryName}`,
      }),
    });

    if (!response.ok) {
      return "";
    }

    return response.text();
  }

  sanitizeHtml(html) {
    let template = document.createElement("template");
    template.innerHTML = html;

    let blockedTags = [
      "script",
      "iframe",
      "object",
      "embed",
      "style",
      "link",
      "meta",
      "base",
      "form",
      "input",
      "button",
      "textarea",
      "select",
    ];

    blockedTags.forEach((tag) => {
      template.content.querySelectorAll(tag).forEach((element) => {
        element.remove();
      });
    });

    template.content.querySelectorAll("*").forEach((element) => {
      [...element.attributes].forEach((attribute) => {
        let name = attribute.name.toLowerCase();
        let value = attribute.value.trim();

        if (name.startsWith("on")) {
          element.removeAttribute(attribute.name);
          return;
        }

        if (
          (name === "href" || name === "src" || name === "xlink:href") &&
          /^javascript:/i.test(value)
        ) {
          element.removeAttribute(attribute.name);
        }
      });

      if (element.tagName === "A") {
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noopener noreferrer");
      }
    });

    return template.innerHTML;
  }

  createRepositoryActions(repository) {
    let actions = document.createElement("div");
    actions.className = "repo-actions";

    let githubLink = document.createElement("a");
    githubLink.href = repository.html_url;
    githubLink.textContent = "GitHub";
    githubLink.target = "_blank";
    githubLink.rel = "noopener noreferrer";

    actions.append(githubLink);

    let homepage = (repository.homepage ?? "").trim();
    if (homepage) {
      let websiteLink = document.createElement("a");
      websiteLink.href = /^https?:\/\//i.test(homepage)
        ? homepage
        : `https://${homepage}`;
      websiteLink.textContent = "Website";
      websiteLink.target = "_blank";
      websiteLink.rel = "noopener noreferrer";
      actions.append(websiteLink);
    }

    return actions;
  }

  formatDate(value) {
    if (!value) return "Sem data";

    let date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Sem data";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }

  addRepositoryLinkEvent(element, url, repository) {
    let openAction = () => {
      if (repository) {
        this.openRepositoryModal(repository);
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    };

    element.addEventListener("click", (event) => {
      if (
        event.target instanceof Element &&
        event.target.closest("a, button")
      ) {
        return;
      }

      openAction();
    });

    element.addEventListener("keypress", (e) => {
      if (e.target instanceof Element && e.target.closest("a, button")) {
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAction();
      }
    });
  }
}

let repositoriesRenderer = new githubRepositories(
  cardsContainer,
  listaContainer,
  userProfileContainer,
);

repositoriesRenderer.init();
