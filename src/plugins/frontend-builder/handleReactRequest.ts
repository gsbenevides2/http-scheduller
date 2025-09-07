import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { createStaticRouter, StaticRouterProvider } from "react-router";
import {
	AuthService,
	InvalidCredentialsError,
} from "../../backend/services/AuthService";
import type { RouteObjectWithData } from "../../frontend/router/routes";
import { staticRouterHandler } from "../../frontend/router/staticHandler";

export async function handleReactRequest(request: Request) {
	const { query } = staticRouterHandler;

	const context = await query(request);
	if (context instanceof Response) {
		return context;
	}

	const router = createStaticRouter(staticRouterHandler.dataRoutes, context);
	const data = context.matches
		.map((match) => {
			const route = match.route;
			if ("data" in route) {
				return (route as RouteObjectWithData).data;
			}
			return null;
		})
		.filter((data) => data !== null)[0];

	if (data?.protected) {
		const cookies = new Bun.CookieMap(request.headers.get("cookie") ?? "");
		const token = cookies.get("token");
		if (!token) {
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/login",
				},
			});
		}
		const decoded = await AuthService.verify(token);
		if (!decoded || decoded instanceof InvalidCredentialsError) {
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/login",
					"Set-Cookie": `token=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`,
				},
			});
		}
	}

	const stream = await renderToReadableStream(
		createElement(StaticRouterProvider, {
			router,
			context,
		}),
		{
			bootstrapScripts: ["index.js"],
		},
	);

	return new Response(stream, {
		headers: {
			"Content-Type": "text/html",
		},
	});
}
