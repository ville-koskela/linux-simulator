import { z } from "zod";

type EnvSchema = z.ZodObject<{
  DEV: z.ZodBoolean;
  VITE_API_URL: z.ZodDefault<z.ZodString>;
  VITE_OAUTH_ISSUER: z.ZodDefault<z.ZodString>;
  VITE_OAUTH_CLIENT_ID: z.ZodDefault<z.ZodString>;
  VITE_OAUTH_SCOPES: z.ZodDefault<z.ZodString>;
  VITE_OAUTH_AUTHORIZE_ENDPOINT: z.ZodDefault<z.ZodString>;
}>;

const envSchema: EnvSchema = z.object({
  DEV: z.boolean(),
  VITE_API_URL: z.string().default("http://localhost:3001"),
  VITE_OAUTH_ISSUER: z.string().default("https://www.operationmonkey.net"),
  VITE_OAUTH_CLIENT_ID: z.string().default("linux-simulator"),
  VITE_OAUTH_SCOPES: z.string().default("openid profile email"),
  VITE_OAUTH_AUTHORIZE_ENDPOINT: z
    .string()
    .default("https://www.operationmonkey.net/monkeykey/api/v1/oauth/authorize"),
});

const parsed: z.SafeParseReturnType<z.input<EnvSchema>, z.output<EnvSchema>> = envSchema.safeParse(
  import.meta.env
);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration:\n${parsed.error.toString()}`);
}

export const env = {
  isDev: parsed.data.DEV,
  apiUrl: parsed.data.VITE_API_URL,
  oauthIssuer: parsed.data.VITE_OAUTH_ISSUER,
  oauthClientId: parsed.data.VITE_OAUTH_CLIENT_ID,
  oauthScopes: parsed.data.VITE_OAUTH_SCOPES,
  oauthAuthorizeEndpoint: parsed.data.VITE_OAUTH_AUTHORIZE_ENDPOINT,
} as const;
