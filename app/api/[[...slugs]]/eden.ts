import { treaty } from "@elysia/eden";
import type { App } from "./route";

export const client = treaty<App>("localhost:3000");
