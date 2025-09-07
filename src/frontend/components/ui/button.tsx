import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import React from "react";

import { cn } from "../../../utils/cn";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
	{
		variants: {
			variant: {
				default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
				destructive: "bg-red-900 text-red-200 hover:bg-red-800 shadow-sm",
				outline:
					"border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white shadow-sm",
				secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 shadow-sm",
				ghost: "text-gray-400 hover:bg-gray-700 hover:text-white",
				link: "text-blue-400 underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 rounded-md px-3",
				lg: "h-10 rounded-md px-6",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

function ButtonLink({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"a"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "a";
	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, ButtonLink, buttonVariants };
