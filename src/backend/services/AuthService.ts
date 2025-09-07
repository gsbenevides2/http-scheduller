import crypto from "node:crypto";
import * as jose from "jose";
import { getEnv } from "../../utils/getEnv";

export class InvalidCredentialsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidCredentialsError";
	}
}

export class AuthService {
	token: string | null = null;
	static username = getEnv("AUTH_USERNAME");
	static password = getEnv("AUTH_PASSWORD");
	static secret = getEnv("AUTH_SECRET");
	static sessionId: string | null = null;

	static generateUniqueSessionId() {
		AuthService.sessionId = crypto.randomBytes(32).toString("hex");
	}

	static async authenticate(username: string, password: string) {
		if (username !== AuthService.username) {
			return new InvalidCredentialsError("Invalid email");
		}

		if (password !== AuthService.password) {
			return new InvalidCredentialsError("Invalid password");
		}

		AuthService.generateUniqueSessionId();

		const privateKey = new TextEncoder().encode(
			`${AuthService.secret}:${AuthService.sessionId}`,
		);
		const token = await new jose.SignJWT({ username })
			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime("1h")
			.sign(privateKey);

		return token;
	}

	static async verify(token: string) {
		if (!AuthService.sessionId) {
			return new InvalidCredentialsError("No session id found");
		}
		try {
			const privateKey = new TextEncoder().encode(
				`${AuthService.secret}:${AuthService.sessionId}`,
			);
			const { payload } = await jose.jwtVerify(token, privateKey);
			return payload;
		} catch (_) {
			return new InvalidCredentialsError("Invalid token");
		}
	}

	static async verifyFromHeader(headerValue: string) {
		if (AuthService.secret !== headerValue) {
			return false;
		}
		return true;
	}

	static async regenerateToken() {
		AuthService.generateUniqueSessionId();
		const privateKey = new TextEncoder().encode(
			`${AuthService.secret}:${AuthService.sessionId}`,
		);
		const token = await new jose.SignJWT({ username: AuthService.username })
			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime("1h")
			.sign(privateKey);
		return token;
	}

	static async logout() {
		AuthService.sessionId = null;
	}
}
