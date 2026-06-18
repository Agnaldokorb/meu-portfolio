import { toMysqlDateTime } from "./date";
import { getServerEnv, type ServerEnv } from "./env";
import type {
  GitHubCommit,
  GitHubRepository,
  RepositoryUpsertInput,
} from "@/types/repository";

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export class GitHubService {
  private readonly baseUrl = "https://api.github.com";

  constructor(private readonly env: ServerEnv = getServerEnv()) {}

  async listPublicRepositories(): Promise<GitHubRepository[]> {
    const repositories: GitHubRepository[] = [];
    let page = 1;

    while (true) {
      const pageRepositories = await this.request<GitHubRepository[]>(
        `/users/${encodeURIComponent(
          this.env.GITHUB_USERNAME,
        )}/repos?sort=updated&per_page=100&page=${page}`,
      );

      repositories.push(...pageRepositories);

      if (pageRepositories.length < 100) {
        return repositories;
      }

      page += 1;
    }
  }

  async getRepository(repositoryName: string): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(
      `/repos/${encodeURIComponent(this.env.GITHUB_USERNAME)}/${encodeURIComponent(
        repositoryName,
      )}`,
    );
  }

  async getReadme(repositoryName: string): Promise<string | null> {
    try {
      return await this.request<string>(
        `/repos/${encodeURIComponent(this.env.GITHUB_USERNAME)}/${encodeURIComponent(
          repositoryName,
        )}/readme`,
        "application/vnd.github.raw+json",
      );
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) {
        return null;
      }

      console.error(`Erro ao buscar README do repositorio ${repositoryName}`, error);
      return null;
    }
  }

  async getLatestCommit(
    repositoryName: string,
    defaultBranch: string,
  ): Promise<GitHubCommit | null> {
    try {
      const commits = await this.request<GitHubCommit[]>(
        `/repos/${encodeURIComponent(this.env.GITHUB_USERNAME)}/${encodeURIComponent(
          repositoryName,
        )}/commits?per_page=1&sha=${encodeURIComponent(defaultBranch)}`,
      );

      return commits[0] ?? null;
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 409) {
        return null;
      }

      console.error(
        `Erro ao buscar ultimo commit do repositorio ${repositoryName}`,
        error,
      );
      return null;
    }
  }

  async toRepositoryRecord(
    repository: GitHubRepository,
  ): Promise<RepositoryUpsertInput> {
    const [readmeMd, latestCommit] = await Promise.all([
      this.getReadme(repository.name),
      this.getLatestCommit(repository.name, repository.default_branch),
    ]);

    return {
      github_id: repository.id,
      nome: repository.name,
      url_github: repository.html_url,
      url_website: repository.homepage?.trim() || null,
      descricao: repository.description,
      readme_md: readmeMd,
      ultimo_commit_sha: latestCommit?.sha ?? null,
      ultimo_commit_msg: latestCommit?.commit.message ?? null,
      ultimo_commit_data: toMysqlDateTime(
        latestCommit?.commit.author?.date ?? repository.pushed_at,
      ),
    };
  }

  private async request<T>(path: string, accept = "application/vnd.github+json"): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      cache: "no-store",
      headers: {
        Accept: accept,
        "User-Agent": "agnaldo-portfolio-api",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(this.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${this.env.GITHUB_TOKEN}` }
          : {}),
      },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new GitHubApiError(
        `GitHub API respondeu ${response.status}: ${details.slice(0, 300)}`,
        response.status,
      );
    }

    if (accept.includes("raw")) {
      return response.text() as Promise<T>;
    }

    return response.json() as Promise<T>;
  }
}
