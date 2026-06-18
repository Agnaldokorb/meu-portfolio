import { z } from "zod";

const serverEnvSchema = z.object({
  MYSQL_HOST: z.string().trim().min(1, "MYSQL_HOST e obrigatorio"),
  MYSQL_PORT: z.coerce.number().int().positive().default(3306),
  MYSQL_USER: z.string().trim().min(1, "MYSQL_USER e obrigatorio"),
  MYSQL_PASSWORD: z.string().default(""),
  MYSQL_DATABASE: z.string().trim().min(1, "MYSQL_DATABASE e obrigatorio"),
  GITHUB_USERNAME: z.string().trim().min(1).default("Agnaldokorb"),
  GITHUB_TOKEN: z.string().trim().optional().default(""),
  GITHUB_WEBHOOK_SECRET: z.string().trim().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new ConfigurationError(message);
  }

  return parsed.data;
}
