import "server-only";

/**
 * Centralised, validated access to environment variables.
 * Throws early (at import time on the server) when a required value is missing.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required environment variable "${name}". See .env.example.`
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  databaseUrl: () => required("DATABASE_URL"),
  authSecret: () => required("AUTH_SECRET"),
  appUrl: () => optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  storageDriver: () =>
    optional("STORAGE_DRIVER", "local") as "local" | "blob",
};
