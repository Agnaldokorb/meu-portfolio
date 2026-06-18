import { getServerEnv } from "@/lib/env";
import { errorResponse, jsonResponse, optionsResponse } from "@/lib/http";
import { syncRepositoryByName } from "@/lib/sync";
import {
  type GitHubWebhookPayload,
  verifyGitHubSignature,
} from "@/lib/webhook";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  try {
    const rawBody = await request.text();
    const env = getServerEnv();
    const signature = request.headers.get("x-hub-signature-256");

    if (!verifyGitHubSignature(rawBody, signature, env.GITHUB_WEBHOOK_SECRET)) {
      return jsonResponse(
        {
          error: "Assinatura invalida",
          message: "Webhook rejeitado",
        },
        { status: 401 },
      );
    }

    const event = request.headers.get("x-github-event") ?? "unknown";
    const payload = JSON.parse(rawBody) as GitHubWebhookPayload;

    if (event === "ping") {
      return jsonResponse({
        message: "Webhook do GitHub conectado",
        event,
      });
    }

    const repositoryName = payload.repository?.name;

    if (!repositoryName || payload.action === "deleted") {
      return jsonResponse({
        message: "Evento ignorado",
        event,
      });
    }

    const repository = await syncRepositoryByName(repositoryName);

    return jsonResponse({
      message: "Repositorio atualizado pelo webhook",
      event,
      repository: repository.nome,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export function OPTIONS(): Response {
  return optionsResponse();
}
