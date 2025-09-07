import { Elysia, t } from "elysia";
import { AuthService, InvalidCredentialsError } from "../services/AuthService";

const AuthController = new Elysia({
	prefix: "/auth",
	detail: {
		tags: ["Auth"],
	},
})
	.post(
		"/login",
		async ({ body, status, cookie }) => {
			const { username, password } = body;
			const response = await AuthService.authenticate(username, password);
			if (response instanceof InvalidCredentialsError) {
				return status(401, {
					error: "Invalid credentials",
				});
			}

			cookie.token.value = response;
			cookie.token.httpOnly = true;
			cookie.token.secure = true;
			cookie.token.sameSite = "lax";
			cookie.token.maxAge = 3600000; // 1 hour
			cookie.token.path = "/";

			return status(200, {
				success: true,
				token: response,
			});
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean({
						title: "Success",
						description: "If the login was successful",
						example: true,
					}),
					token: t.String({
						title: "Token",
						description: "The token to login",
						example: "1234567890",
					}),
				}),
				401: t.Object({
					error: t.String({
						title: "Error",
						description: "The error message",
						example: "Invalid credentials",
					}),
				}),
			},
			cookie: t.Object({
				token: t.Optional(
					t.String({
						title: "Token",
						description: "The token to login",
						example: "1234567890",
					}),
				),
			}),
			body: t.Object({
				username: t.String({
					title: "Username",
					description: "The username to login",
					example: "admin",
				}),
				password: t.String({
					title: "Password",
					description: "The password to login",
					example: "1234567890",
				}),
			}),
			detail: {
				summary: "Login to the application",
				description:
					"Login to the application. This request will set a cookie with the token. The token is valid for 1 hour.",
			},
		},
	)
	.post(
		"/logout",
		async ({ cookie }) => {
			cookie.token.value = "";
			await AuthService.logout();
			return {
				success: true,
			};
		},
		{
			cookie: t.Object({
				token: t.Optional(
					t.String({
						title: "Token",
						description: "The token to logout",
						example: "1234567890",
					}),
				),
			}),
			response: {
				200: t.Object({
					success: t.Boolean({
						title: "Success",
						description: "If the logout was successful",
						example: true,
					}),
				}),
			},
			detail: {
				summary: "Logout from the application",
				description:
					"Logout from the application. This request will remove the cookie with the token.",
			},
		},
	);

export default AuthController;
