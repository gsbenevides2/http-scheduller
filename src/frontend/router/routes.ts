import type { RouteObject } from "react-router";
import { NotFound } from "../pages/404";
import { ErrorPage } from "../pages/Error";
import { Home } from "../pages/Home";
import { LoginPage } from "../pages/LoginPage";
import { Success } from "../pages/Success";
import { Root } from "../Root";

export type RouteObjectWithData = RouteObject & {
	children?: RouteObjectWithData[];
	data?: {
		protected?: boolean;
	};
};

export const routes: RouteObjectWithData[] = [
	{
		path: "/",
		Component: Root,
		children: [
			{
				index: true,
				Component: Home,
				data: {
					protected: true,
				},
			},
			{
				path: "/login",
				Component: LoginPage,
			},
			{
				path: "/success",
				Component: Success,
				data: {
					protected: true,
				},
			},
			{
				path: "/error",
				Component: ErrorPage,
				data: {
					protected: true,
				},
			},
		],
	},
	{
		path: "*",
		Component: Root,
		children: [
			{
				path: "*",
				Component: NotFound,
			},
		],
	},
];
