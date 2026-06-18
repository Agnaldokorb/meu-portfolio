import { errorResponse, jsonResponse, optionsResponse } from "@/lib/http";
import { RepositoryService } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const repositoryService = new RepositoryService();
    const repositories = await repositoryService.list();

    return jsonResponse(repositories);
  } catch (error) {
    return errorResponse(error);
  }
}

export function OPTIONS(): Response {
  return optionsResponse();
}
