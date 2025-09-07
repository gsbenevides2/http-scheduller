import {
	isDevelopmentMode,
	isProductionMode,
} from "../../utils/isProductionMode";
import type { ReactBuilderOptions } from "./types";

export async function buildReact(options: ReactBuilderOptions) {
	const output = await Bun.build({
		entrypoints: [options.entrypoint],
		minify: isProductionMode(),
		sourcemap: isDevelopmentMode() ? "inline" : "none",
	});
	const js = output.outputs[0];

	return () => {
		return new Response(js, {
			headers: {
				"Content-Type": "application/javascript",
			},
		});
	};
}
