let cardsContainer = document.querySelector("#cards-container");
let listaContainer = document.querySelector("#lista-container");
let userProfileContainer = document.querySelector("#card-user-container");

let GITHUB_USERNAME = "AgnaldoKorb";
let GITHUB_USER_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;
let GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&direction=desc&per_page=100`;
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
    let response = await fetch(GITHUB_API_URL);

    if (!response.ok) {
      throw new Error(`Erro ao buscar repositórios: ${response.status}`);
    }

    let data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Resposta inesperada da API do Github");
    }

    return data;
  }

  async fetchUserProfile() {
    let response = await fetch(GITHUB_USER_API_URL);

    if (!response.ok) {
      throw new Error(`Erro ao buscar perfil do usuário: ${response.status}`);
    }

    return response.json();
  }

  async fetchRepositoryReadme(repositoryName) {
    let response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repositoryName}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.raw+json",
        },
      },
    );

    if (response.status === 404) {
      return "README.md principal nao encontrado para este repositorio.";
    }

    if (!response.ok) {
      throw new Error(`Erro ao buscar README: ${response.status}`);
    }

    return response.text();
  }

  async renderReadmeMarkdown(markdownText, repositoryName) {
    let response = await fetch("https://api.github.com/markdown", {
      method: "POST",
      headers: {
        Accept: "text/html",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: markdownText,
        mode: "gfm",
        context: `${GITHUB_USERNAME}/${repositoryName}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao renderizar markdown: ${response.status}`);
    }

    return response.text();
  }

  escapeHtml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  setLoading() {
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
  }

  renderUserProfile(profile) {
    if (!this.userProfileElement) return;

    this.userProfileElement.replaceChildren(this.createCardUser(profile));
  }

  renderError() {
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

    card.append(img, title, description);
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

    let language = document.createElement("p");
    language.textContent = `Linguagem: ${repository.language ?? "Desconhecida"}`;

    item.append(title, language);
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

    try {
      let readme = this.readmeCache.get(repository.name);
      if (!readme) {
        readme = await this.fetchRepositoryReadme(repository.name);
        this.readmeCache.set(repository.name, readme);
      }

      try {
        let renderedReadme = await this.renderReadmeMarkdown(
          readme,
          repository.name,
        );
        readmeContent.innerHTML = renderedReadme;
      } catch (renderError) {
        console.error("Erro ao renderizar markdown:", renderError);
        readmeContent.innerHTML = `<pre>${this.escapeHtml(readme)}</pre>`;
      }
    } catch (error) {
      console.error("Erro ao carregar README:", error);
      readmeContent.textContent =
        "Nao foi possivel carregar o README.md agora. Tente novamente em instantes.";
    }
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

  addRepositoryLinkEvent(element, url, repository) {
    let openAction = () => {
      if (repository) {
        this.openRepositoryModal(repository);
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    };

    element.addEventListener("click", openAction);

    element.addEventListener("keypress", (e) => {
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
