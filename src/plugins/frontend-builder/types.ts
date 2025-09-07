import type tw from "@tailwindcss/postcss";

type PluginOptions = Parameters<typeof tw>[0];

export interface ReactBuilderOptions {
	entrypoint: string;
}

export interface TailwindBuilderOptions {
	source: string;
	tailwindConfig?: PluginOptions;
}

export interface FrontendBuilderOptions {
	react: ReactBuilderOptions;
	tailwind: TailwindBuilderOptions;
}
