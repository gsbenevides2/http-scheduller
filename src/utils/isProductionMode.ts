export function isProductionMode() {
	return Bun.env.ENABLE_PRODUCTION_MODE === "true";
}

export function isDevelopmentMode() {
	return !isProductionMode();
}
