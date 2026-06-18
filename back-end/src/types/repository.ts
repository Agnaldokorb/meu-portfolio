export type GitHubRepository = {
  id: number;
  name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  owner: {
    login: string;
  };
};

export type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    committer: {
      date: string;
    };
  };
};

export type RepositoryRecord = {
  id: number;
  github_id: bigint | number;
  nome: string;
  url_github: string;
  url_website: string | null;
  descricao: string | null;
  readme_md: string | null;
  ultimo_commit_sha: string | null;
  ultimo_commit_msg: string | null;
  ultimo_commit_data: Date | string | null;
  created_at: Date;
  updated_at: Date;
};

export type SyncedRepositoryInput = {
  github_id: number;
  nome: string;
  url_github: string;
  url_website: string | null;
  descricao: string | null;
  readme_md: string | null;
  ultimo_commit_sha: string | null;
  ultimo_commit_msg: string | null;
  ultimo_commit_data: Date | null;
};
