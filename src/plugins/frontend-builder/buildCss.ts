import tw from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcss from "postcss";
import {
	isDevelopmentMode,
	isProductionMode,
} from "../../utils/isProductionMode";
import type { TailwindBuilderOptions } from "./types";

export async function buildCss(options: TailwindBuilderOptions) {
	const { source, tailwindConfig } = options;
	const sourceText = await Bun.file(source).text();
	const plugins = [tw(tailwindConfig), autoprefixer()];

	if (isProductionMode()) {
		plugins.push(cssnano());
	}
	const result = await postcss(...plugins).process(sourceText, {
		from: source,
		map: isDevelopmentMode(),
	});
	const css = result.css;

	return () => {
		return new Response(css, {
			headers: {
				"Content-Type": "text/css",
			},
		});
	};
}
