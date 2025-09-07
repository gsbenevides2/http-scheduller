import { Elysia } from "elysia";

export const coolifyHealthChecker = new Elysia().get(
	"/health",
	() => {
		return "OK";
	},
	{
		detail: {
			description: "Health check for coolify",
			tags: ["Coolify"],
		},
	},
);
