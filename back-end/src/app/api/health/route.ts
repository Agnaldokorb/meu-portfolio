import { jsonResponse, optionsResponse } from "@/lib/http";

export function GET(): Response {
  return jsonResponse({
    status: "ok",
    message: "API funcionando",
  });
}

export function OPTIONS(): Response {
  return optionsResponse();
}
