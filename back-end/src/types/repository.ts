export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string | null;
    } | null;
  };
}

export interface RepositoryUpsertInput {
  github_id: number;
  nome: string;
  url_github: string;
  url_website: string | null;
  descricao: string | null;
  readme_md: string | null;
  ultimo_commit_sha: string | null;
  ultimo_commit_msg: string | null;
  ultimo_commit_data: string | null;
}

export interface RepositoryRecord extends RepositoryUpsertInput {
  id: number;
  created_at: string;
  updated_at: string;
}
