import http, { type Server as HttpServer } from "node:http";
import { apolloServer } from "@/apolloServer.js";
import { expressApp } from "@/expressApp.js";
import type { Asyncify } from "type-fest";

/**
 * An {@link HttpServer} instance created from the express app.
 *
 * See https://www.apollographql.com/docs/apollo-server/api/express-middleware#example
 */
export const httpServer = http.createServer(expressApp) as HttpServerWithCustomStart;

httpServer.start = async (listenOpts = {}, listenCallback) => {
  await apolloServer.configurePlugins({ httpServer });
  await apolloServer.start();
  expressApp.setupMiddleware();
  return httpServer.listen(listenOpts, listenCallback);
};

export type HttpServerWithCustomStart = HttpServer & {
  /**
   * A thin wrapper around `httpServer.listen` which executes server-startup logic:
   *
   * 1. [`await apolloServer.configurePlugins(...)`](./apolloServer.ts)
   * 2. [`await apolloServer.start()`][apollo-server-ref]
   * 3. [`expressApp.setupMiddleware()`](./expressApp.ts)
   * 4. `httpServer.listen(...)`
   *
   * [apollo-server-ref]: https://www.apollographql.com/docs/apollo-server/api/apollo-server#start
   */
  start: Asyncify<typeof httpServer.listen>;
};
