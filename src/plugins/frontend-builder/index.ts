import Elysia from "elysia";
import { buildCss } from "./buildCss";
import { buildReact } from "./buildReact";
import { handleReactRequest } from "./handleReactRequest";
import type { FrontendBuilderOptions } from "./types";

export async function frontEndBuilder(options: FrontendBuilderOptions) {
	const { react, tailwind } = options;
	const handlerReactJs = await buildReact(react);
	const handleStyles = await buildCss(tailwind);

	const app = new Elysia({ name: "frontend-builder", seed: {} })
		.get("/", ({ request }) => handleReactRequest(request), {
			detail: {
				hide: true,
			},
		})
		.get("/login", ({ request }) => handleReactRequest(request), {
			detail: {
				hide: true,
			},
		})
		.get("/success", ({ request }) => handleReactRequest(request), {
			detail: {
				hide: true,
			},
		})
		.get("/error", ({ request }) => handleReactRequest(request), {
			detail: {
				hide: true,
			},
		})
		.get("/styles.css", handleStyles, {
			detail: {
				hide: true,
			},
		})
		.get("/index.js", handlerReactJs, {
			detail: {
				hide: true,
			},
		})
		.get("/favicon.ico", () => {
			return Bun.file("src/frontend/favicon.ico");
		})
		.onError({ as: "global" }, async ({ error, request }) => {
			const is404 = "status" in error && error.status === 404;
			const isBrowser = request.headers.get("accept")?.includes("text/html");
			if (is404 && isBrowser) {
				const response = await handleReactRequest(request);

				return new Response(response.body, {
					status: 404,
					headers: response.headers,
				});
			}
		});

	return app;
}
