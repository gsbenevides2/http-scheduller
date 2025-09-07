import { createStaticHandler } from "react-router";
import { routes } from "./routes";

export const staticRouterHandler = createStaticHandler(routes);
