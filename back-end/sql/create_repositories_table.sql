CREATE TABLE IF NOT EXISTS repositories (
  id BIGSERIAL PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  url_github VARCHAR(500) NOT NULL,
  url_website VARCHAR(500),
  descricao TEXT,
  readme_md TEXT,
  ultimo_commit_sha VARCHAR(100),
  ultimo_commit_msg TEXT,
  ultimo_commit_data TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
