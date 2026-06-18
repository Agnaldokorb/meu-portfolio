import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { mysqlDateTimeToIso } from "./date";
import { getDbPool } from "./db";
import type { RepositoryRecord, RepositoryUpsertInput } from "@/types/repository";

type RepositoryRow = RowDataPacket & {
  id: number;
  github_id: number;
  nome: string;
  url_github: string;
  url_website: string | null;
  descricao: string | null;
  readme_md: string | null;
  ultimo_commit_sha: string | null;
  ultimo_commit_msg: string | null;
  ultimo_commit_data: string | null;
  created_at: string;
  updated_at: string;
};

export class RepositoryService {
  async upsert(repository: RepositoryUpsertInput): Promise<void> {
    const pool = getDbPool();

    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO repositories (
          github_id,
          nome,
          url_github,
          url_website,
          descricao,
          readme_md,
          ultimo_commit_sha,
          ultimo_commit_msg,
          ultimo_commit_data
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nome = VALUES(nome),
          url_github = VALUES(url_github),
          url_website = VALUES(url_website),
          descricao = VALUES(descricao),
          readme_md = VALUES(readme_md),
          ultimo_commit_sha = VALUES(ultimo_commit_sha),
          ultimo_commit_msg = VALUES(ultimo_commit_msg),
          ultimo_commit_data = VALUES(ultimo_commit_data)
      `,
      [
        repository.github_id,
        repository.nome,
        repository.url_github,
        repository.url_website,
        repository.descricao,
        repository.readme_md,
        repository.ultimo_commit_sha,
        repository.ultimo_commit_msg,
        repository.ultimo_commit_data,
      ],
    );
  }

  async upsertMany(repositories: RepositoryUpsertInput[]): Promise<number> {
    for (const repository of repositories) {
      await this.upsert(repository);
    }

    return repositories.length;
  }

  async list(): Promise<RepositoryRecord[]> {
    const pool = getDbPool();
    const [rows] = await pool.query<RepositoryRow[]>(
      `
        SELECT
          id,
          github_id,
          nome,
          url_github,
          url_website,
          descricao,
          readme_md,
          ultimo_commit_sha,
          ultimo_commit_msg,
          ultimo_commit_data,
          created_at,
          updated_at
        FROM repositories
        ORDER BY
          ultimo_commit_data IS NULL ASC,
          ultimo_commit_data DESC,
          updated_at DESC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      github_id: Number(row.github_id),
      nome: row.nome,
      url_github: row.url_github,
      url_website: row.url_website,
      descricao: row.descricao,
      readme_md: row.readme_md,
      ultimo_commit_sha: row.ultimo_commit_sha,
      ultimo_commit_msg: row.ultimo_commit_msg,
      ultimo_commit_data: mysqlDateTimeToIso(row.ultimo_commit_data),
      created_at: mysqlDateTimeToIso(row.created_at) ?? row.created_at,
      updated_at: mysqlDateTimeToIso(row.updated_at) ?? row.updated_at,
    }));
  }
}
