import { listRepositories } from "@/lib/repositories";
import type { RepositoryRecord } from "@/types/repository";

export const dynamic = "force-dynamic";

function serializeRepository(record: RepositoryRecord) {
  return {
    ...record,
    github_id:
      typeof record.github_id === "bigint"
        ? Number(record.github_id)
        : record.github_id,
    ultimo_commit_data:
      record.ultimo_commit_data instanceof Date
        ? record.ultimo_commit_data.toISOString()
        : record.ultimo_commit_data,
    created_at:
      record.created_at instanceof Date
        ? record.created_at.toISOString()
        : record.created_at,
    updated_at:
      record.updated_at instanceof Date
        ? record.updated_at.toISOString()
        : record.updated_at,
  };
}

export async function GET() {
  try {
    const repositories = await listRepositories();
    return Response.json(repositories.map(serializeRepository));
  } catch (error) {
    console.error("Erro ao listar repositorios:", error);
    return Response.json(
      {
        message: "Erro ao listar repositórios no banco de dados.",
      },
      { status: 500 },
    );
  }
}
