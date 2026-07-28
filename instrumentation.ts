import { CronnerService } from "./server/services/Cronner";

export const runtime = "nodejs";

let shutdownRegistered = false;

function registerShutdownHandlers() {
  if (shutdownRegistered) return;
  shutdownRegistered = true;

  const shutdown = async (signal: string) => {
    console.log(`[instrumentation] Received ${signal}, shutting down gracefully...`);
    await CronnerService.gracefulShutdown();
    const proc = globalThis.process;
    proc?.exit?.(0);
  };

  const proc = globalThis.process;
  if (proc?.on) {
    proc.on("SIGTERM", () => shutdown("SIGTERM"));
    proc.on("SIGINT", () => shutdown("SIGINT"));
  }
}

export function register() {
  CronnerService.gracefulStart();
  registerShutdownHandlers();
}
