import { Elysia, t } from "elysia";
import {
	type HttpScheduller,
	HttpSchedullerService,
} from "../services/HttpScheduller";

const httpSchedullerSchema = t.Object({
	externalId: t.String({
		title: "External ID",
		description: "The external ID of the http scheduller",
		example: "1234567890",
	}),
	triggerType: t.Union([t.Literal("cron"), t.Literal("date")], {
		title: "Trigger Type",
		description: "The trigger type of the http scheduller",
		example: "cron",
	}),
	excludeBeforeExecution: t.Boolean({
		title: "Exclude Before Execution",
		description: "If the http scheduller should exclude before execution",
		example: true,
	}),
	triggerValue: t.String({
		title: "Trigger Value",
		description: "The trigger value of the http scheduller",
		example: "0 0 * * *",
	}),
	url: t.String({
		title: "URL",
		description: "The URL of the http scheduller",
		example: "https://www.google.com",
	}),
	method: t.Union(
		[
			t.Literal("GET"),
			t.Literal("POST"),
			t.Literal("PUT"),
			t.Literal("DELETE"),
			t.Literal("PATCH"),
		],
		{
			title: "Method",
			description: "The method of the http scheduller",
			example: "GET",
		},
	),
	headers: t.Record(t.String(), t.String(), {
		title: "Headers",
		description: "The headers of the http scheduller",
		example: {
			"Content-Type": "application/json",
		},
	}),
	body: t.String({
		title: "Body",
		description: "The body of the http scheduller",
		example: '{"name": "John", "age": 30}',
	}),
});
const exemple: HttpScheduller = {
	externalId: "1234567890",
	triggerType: "cron",
	excludeBeforeExecution: true,
	triggerValue: "0 0 * * *",
	url: "https://www.google.com",
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
	body: '{"name": "John", "age": 30}',
};

const HttpSchedullerController = new Elysia({
	prefix: "/http-scheduller",
	detail: {
		tags: ["Http Scheduller"],
		description: "Http Scheduller endpoints",
		security: [
			{
				headerAuth: [],
			},
		],
	},
})
	.get(
		"/",
		async () => {
			return await HttpSchedullerService.getAll();
		},
		{
			detail: {
				summary: "Get all http scheduller",
				description: "Get all http scheduller",
			},
			response: {
				200: t.Array(httpSchedullerSchema, {
					title: "Http Scheduller",
					description: "The http scheduller",
					example: [exemple],
				}),
			},
		},
	)
	.post(
		"/",
		async ({ body, status }) => {
			await HttpSchedullerService.createOrUpdateMany(body.schedullers);
			return status(200, undefined);
		},
		{
			detail: {
				summary: "Create or update many http scheduller",
				description: "Create or update http scheduller",
			},
			body: t.Object({
				schedullers: t.Array(httpSchedullerSchema, {
					title: "Http Scheduller",
					description: "The http scheduller",
					example: [exemple],
				}),
			}),
			response: {
				200: t.Undefined(),
			},
		},
	)
	.delete(
		"/",
		async ({ body, status }) => {
			await HttpSchedullerService.deleteMany(body.ids);
			return status(200, undefined);
		},
		{
			detail: {
				summary: "Delete many http scheduller",
				description: "Delete http scheduller",
			},
			body: t.Object({
				ids: t.Array(t.String(), {
					title: "Ids of the http scheduller",
					description: "The ids of the http scheduller",
				}),
			}),
			response: {
				200: t.Undefined(),
			},
		},
	);

export default HttpSchedullerController;
