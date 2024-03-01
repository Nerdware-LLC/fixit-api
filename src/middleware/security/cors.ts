import cors, { type CorsOptions } from "cors";
import { ENV } from "@/server/env";

const corsOptions: CorsOptions = {
  origin: [
    "https://studio.apollographql.com",
    ...(/^(dev|test)/.test(ENV.NODE_ENV)
      ? [/localhost/]
      : [/^https:\/\/(www\.)?((demo|staging)\.)?gofixit.app/]),
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    // Sentry tracing http headers:
    "sentry-trace",
    "baggage",
    // Apollo GraphQL http headers:
    "apollographql-client-name",
    "apollographql-client-version",
    // Enable ApolloServerPluginInlineTrace
    "apollo-federation-include-trace",
    // Permit access to Apollo Studio queries
    "Apollo-Studio-Auth-Token",
  ],
};

export const corsMW = cors(corsOptions);
