import { cors } from "@elysiajs/cors";
import serverTiming from "@elysiajs/server-timing";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import api from "./backend/api";
import { CronnerService } from "./backend/services/Cronner";
import { coolifyHealthChecker } from "./plugins/coolify-healtcheker";
import { frontEndBuilder } from "./plugins/frontend-builder";
import { logger } from "./plugins/logger";
import { getProjectInfo } from "./utils/getProjectInfo";
import { isDevelopmentMode } from "./utils/isProductionMode";
import { sendServerReadyMessage } from "./utils/sendServerReadyMessage";

await CronnerService.gracefulStart();

const port = Bun.env.PORT || 3000;

const app = new Elysia()
	.use(logger())
	.use(cors())
	.use(
		serverTiming({
			enabled: isDevelopmentMode(),
		}),
	)
	.use(
		swagger({
			documentation: {
				info: getProjectInfo(),
				tags: [
					{
						name: "Systems",
						description: "Systems endpoints",
					},
					{
						name: "Coolify",
						description: "Coolify endpoints",
					},
				],
				components: {
					securitySchemes: {
						headerAuth: {
							type: "apiKey",
							in: "header",
							name: "Authorization",
							description: "Authentication token",
						},
					},
				},
			},
		}),
	)
	.use(coolifyHealthChecker)
	.use(api)

	.use(
		frontEndBuilder({
			react: {
				entrypoint: "./src/frontend/index.tsx",
			},
			tailwind: {
				source: "./src/frontend/styles/app.css",
			},
		}),
	)
	.listen(port, sendServerReadyMessage);

process.on("SIGINT", async () => {
	await CronnerService.gracefulShutdown();
	process.exit(0);
});

export type App = typeof app;
