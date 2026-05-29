import { treaty } from "@elysia/eden";
import type { App } from "./route";

export function getClient() {
  return treaty<App>(window.location.origin);
}
