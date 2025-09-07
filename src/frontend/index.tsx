import React, { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { routes } from "./router/routes";

const router = createBrowserRouter(routes, {
	// @ts-expect-error - hydrationData is not typed
	hydrationData: window.__staticRouterHydrationData,
});

hydrateRoot(
	document,
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
