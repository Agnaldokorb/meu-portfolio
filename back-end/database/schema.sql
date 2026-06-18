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
