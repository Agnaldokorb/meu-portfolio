import { createHmac, timingSafeEqual } from "crypto";

export interface GitHubWebhookPayload {
  action?: string;
  repository?: {
    name?: string;
    full_name?: string;
  };
}

export function verifyGitHubSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!secret) {
    return true;
  }

  if (!signature?.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = `sha256=${createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
