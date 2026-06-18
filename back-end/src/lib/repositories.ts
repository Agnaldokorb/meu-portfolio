import { prisma } from "@/lib/db";
import type {
  RepositoryRecord,
  SyncedRepositoryInput,
} from "@/types/repository";

export async function upsertRepository(
  repository: SyncedRepositoryInput,
): Promise<void> {
  const commitDate = repository.ultimo_commit_data
    ? repository.ultimo_commit_data instanceof Date
      ? repository.ultimo_commit_data
      : new Date(repository.ultimo_commit_data)
    : null;

  await prisma.$executeRaw`
    INSERT INTO repositories (
      github_id,
      nome,
      url_github,
      url_website,
      descricao,
      readme_md,
      ultimo_commit_sha,
      ultimo_commit_msg,
      ultimo_commit_data,
      updated_at
    ) VALUES (
      ${repository.github_id},
      ${repository.nome},
      ${repository.url_github},
      ${repository.url_website},
      ${repository.descricao},
      ${repository.readme_md},
      ${repository.ultimo_commit_sha},
      ${repository.ultimo_commit_msg},
      ${commitDate},
      NOW()
    )
    ON CONFLICT (github_id) DO UPDATE SET
      nome = EXCLUDED.nome,
      url_github = EXCLUDED.url_github,
      url_website = EXCLUDED.url_website,
      descricao = EXCLUDED.descricao,
      readme_md = EXCLUDED.readme_md,
      ultimo_commit_sha = EXCLUDED.ultimo_commit_sha,
      ultimo_commit_msg = EXCLUDED.ultimo_commit_msg,
      ultimo_commit_data = EXCLUDED.ultimo_commit_data,
      updated_at = NOW()
  `;
}

export async function listRepositories(): Promise<RepositoryRecord[]> {
  const records = await prisma.$queryRaw<RepositoryRecord[]>`
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
    ORDER BY ultimo_commit_data DESC
  `;

  return records;
}
