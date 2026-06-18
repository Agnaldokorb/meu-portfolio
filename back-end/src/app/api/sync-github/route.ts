import {
  fetchPublicRepositories,
  getRepositorySyncPayload,
} from "@/lib/github";
import { upsertRepository } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.GITHUB_USERNAME?.trim()) {
      return Response.json(
        {
          message: "Variável GITHUB_USERNAME não está configurada.",
        },
        { status: 500 },
      );
    }

    if (!process.env.GITHUB_TOKEN?.trim()) {
      return Response.json(
        {
          message: "Variável GITHUB_TOKEN não está configurada.",
        },
        { status: 500 },
      );
    }

    const repositories = await fetchPublicRepositories();

    let total = 0;

    for (const repository of repositories) {
      const payload = await getRepositorySyncPayload(repository);
      await upsertRepository(payload);
      total += 1;
    }

    return Response.json({
      message: "Repositórios sincronizados com sucesso",
      total,
    });
  } catch (error) {
    console.error("Erro ao sincronizar repositorios:", error);
    return Response.json(
      {
        message: "Erro ao sincronizar repositórios com o GitHub.",
      },
      { status: 500 },
    );
  }
}
