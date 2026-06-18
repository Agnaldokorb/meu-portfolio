import { ConfigurationError } from "./env";

type JsonBody = Record<string, unknown> | Array<unknown>;

const DEFAULT_ALLOWED_METHODS = "GET, POST, OPTIONS";
const DEFAULT_ALLOWED_HEADERS =
  "Content-Type, X-GitHub-Delivery, X-GitHub-Event, X-Hub-Signature-256";

export function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
    "Access-Control-Allow-Methods": DEFAULT_ALLOWED_METHODS,
    "Access-Control-Allow-Headers": DEFAULT_ALLOWED_HEADERS,
  };
}

export function jsonResponse(
  body: JsonBody,
  init: ResponseInit = {},
): Response {
  return Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders(),
      ...init.headers,
    },
  });
}

export function optionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export function errorResponse(error: unknown): Response {
  console.error(error);

  if (error instanceof ConfigurationError) {
    return jsonResponse(
      {
        error: "Configuracao invalida do servidor",
        message: error.message,
      },
      { status: 500 },
    );
  }

  return jsonResponse(
    {
      error: "Erro interno do servidor",
      message: "Nao foi possivel processar a requisicao agora",
    },
    { status: 500 },
  );
}
