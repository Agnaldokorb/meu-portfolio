import crypto from "node:crypto";

import { getRepositorySyncPayload } from "@/lib/github";
import { upsertRepository } from "@/lib/repositories";
import type { GitHubRepository } from "@/types/repository";

type PushWebhookPayload = {
  repository?: GitHubRepository;
};

function secureCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function isValidGithubSignature(
  body: string,
  signatureHeader: string,
): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();

  if (!secret) {
    return true;
  }

  if (!signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const expected = `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;
  return secureCompare(expected, signatureHeader);
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-hub-signature-256") ?? "";
    const event = request.headers.get("x-github-event") ?? "";

    const rawBody = await request.text();

    if (!isValidGithubSignature(rawBody, signature)) {
      return Response.json(
        { message: "Assinatura do webhook invalida." },
        { status: 401 },
      );
    }

    if (!["push", "repository"].includes(event)) {
      return Response.json(
        { message: "Evento ignorado.", event },
        { status: 202 },
      );
    }

    const payload = JSON.parse(rawBody) as PushWebhookPayload;

    if (!payload.repository) {
      return Response.json(
        { message: "Payload invalido: repositorio nao informado." },
        { status: 400 },
      );
    }

    const repositoryPayload = await getRepositorySyncPayload(
      payload.repository,
    );
    await upsertRepository(repositoryPayload);

    return Response.json({
      message: "Webhook processado com sucesso.",
      repository: payload.repository.name,
    });
  } catch (error) {
    console.error("Erro ao processar webhook do GitHub:", error);
    return Response.json(
      { message: "Erro ao processar webhook do GitHub." },
      { status: 500 },
    );
  }
}
