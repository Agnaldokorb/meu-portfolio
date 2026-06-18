import type { GitHubCommit, GitHubRepository } from "@/types/repository";

const GITHUB_API_BASE_URL = "https://api.github.com";

function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN?.trim();

  if (!token) {
    throw new Error("Variavel GITHUB_TOKEN nao configurada.");
  }

  return token;
}

function buildGithubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${getGitHubToken()}`,
  };

  return headers;
}

function getGitHubUsername(): string {
  const username = process.env.GITHUB_USERNAME?.trim();

  if (!username) {
    throw new Error("Variavel GITHUB_USERNAME nao configurada.");
  }

  return username;
}

async function parseGithubError(response: Response): Promise<never> {
  let details = "";
  try {
    const json = (await response.json()) as { message?: string };
    details = json.message ? ` - ${json.message}` : "";
  } catch {
    details = "";
  }

  throw new Error(
    `Erro na API do GitHub (${response.status} ${response.statusText})${details}`,
  );
}

export async function fetchPublicRepositories(): Promise<GitHubRepository[]> {
  const username = getGitHubUsername();
  const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=999`;

  const response = await fetch(url, {
    headers: buildGithubHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    await parseGithubError(response);
  }

  const repositories = (await response.json()) as GitHubRepository[];
  return repositories;
}

export async function fetchRepositoryReadme(
  owner: string,
  repo: string,
): Promise<string | null> {
  const url = `${GITHUB_API_BASE_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`;
  const response = await fetch(url, {
    headers: {
      ...buildGithubHeaders(),
      Accept: "application/vnd.github.raw+json",
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    await parseGithubError(response);
  }

  return response.text();
}

export async function fetchLatestCommit(
  owner: string,
  repo: string,
): Promise<GitHubCommit | null> {
  const url = `${GITHUB_API_BASE_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=1`;
  const response = await fetch(url, {
    headers: buildGithubHeaders(),
    cache: "no-store",
  });

  if (response.status === 409 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    await parseGithubError(response);
  }

  const commits = (await response.json()) as GitHubCommit[];
  return commits[0] ?? null;
}

export async function getRepositorySyncPayload(repository: GitHubRepository) {
  const [readme, latestCommit] = await Promise.all([
    fetchRepositoryReadme(repository.owner.login, repository.name).catch(() =>
      Promise.resolve(null),
    ),
    fetchLatestCommit(repository.owner.login, repository.name),
  ]);

  return {
    github_id: repository.id,
    nome: repository.name,
    url_github: repository.html_url,
    url_website: repository.homepage ?? null,
    descricao: repository.description ?? null,
    readme_md: readme,
    ultimo_commit_sha: latestCommit?.sha ?? null,
    ultimo_commit_msg: latestCommit?.commit.message ?? null,
    ultimo_commit_data: latestCommit?.commit.committer.date
      ? new Date(latestCommit.commit.committer.date)
      : null,
  };
}
