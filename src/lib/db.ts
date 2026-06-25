import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Neon's serverless driver speaks to the database over WebSockets, which
// avoids the stale TCP connection-pool problems that occur when a Neon compute
// autosuspends. In Node runtimes we must supply the WebSocket implementation.
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

/**
 * A Neon serverless compute autosuspends when idle. The first query after it
 * wakes can fail with a transient connection error (the cached WebSocket has
 * gone stale) before the compute finishes resuming. These errors disappear on
 * an immediate retry, so we transparently retry them a few times.
 */
const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);
const RETRYABLE_PATTERNS = [
  "can't reach database server",
  "connection closed",
  "connection reset",
  "connection terminated",
  "terminating connection",
  "server has closed the connection",
  "timed out fetching a new connection",
  "econnreset",
  "socket hang up",
  "kind: closed",
];

function isRetryable(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  if (code && RETRYABLE_CODES.has(code)) return true;
  const message = (error as { message?: string })?.message?.toLowerCase() ?? "";
  return RETRYABLE_PATTERNS.some((p) => message.includes(p));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString });
  const base = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return base.$extends({
    name: "retry-on-transient-connection-errors",
    query: {
      async $allOperations({ args, query }) {
        const maxAttempts = 4;
        let lastError: unknown;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            return await query(args);
          } catch (error) {
            lastError = error;
            if (attempt === maxAttempts || !isRetryable(error)) throw error;
            // Back off briefly to give the Neon compute time to resume.
            await sleep(250 * attempt);
          }
        }
        throw lastError;
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
