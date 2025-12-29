import { createRequestHandler } from "@netlify/remix-adapter";

export const handler = createRequestHandler({
  build: () => import("./build/server/index.js"),
});
