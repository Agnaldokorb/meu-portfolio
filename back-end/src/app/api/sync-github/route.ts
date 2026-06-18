import { errorResponse, jsonResponse, optionsResponse } from "@/lib/http";
import { syncAllRepositories } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const result = await syncAllRepositories();

    return jsonResponse({
      message: "Repositórios sincronizados com sucesso",
      total: result.total,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export function OPTIONS(): Response {
  return optionsResponse();
}
