import { Elysia } from "elysia";
import AuthController from "./controllers/AuthController";
import HttpSchedullerController from "./controllers/HttpScheduller";
import { AuthService, InvalidCredentialsError } from "./services/AuthService";

const api = new Elysia({
	prefix: "/api",
})
	.onBeforeHandle(async ({ cookie, status, route, headers }) => {
		if (route.startsWith("/api/auth")) {
			return;
		}
		const inHeader = headers.authorization;
		if (inHeader) {
			const result = await AuthService.verifyFromHeader(inHeader);
			if (!result) {
				return status(401, {
					error: "Unauthorized",
				});
			}
			return;
		}

		const token = cookie.token.value;
		if (!token) {
			return status(401, {
				error: "Unauthorized",
			});
		}
		const decoded = await AuthService.verify(token);
		if (!decoded || decoded instanceof InvalidCredentialsError) {
			return status(401, {
				error: "Unauthorized",
			});
		}
	})
	.use(AuthController)
	.use(HttpSchedullerController);

export default api;
