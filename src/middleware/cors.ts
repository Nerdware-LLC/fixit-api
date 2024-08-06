import cors, { type CorsOptions } from "cors";
import { ENV } from "@/server/env";

const corsOptions: CorsOptions = {
  credentials: true,

  origin: [
    ENV.WEB_CLIENT.URL,
    "https://studio.apollographql.com", // Apollo Studio origin for introspection
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    // Sentry tracing base http headers
    "sentry-trace",
    "baggage",
    // Apollo GraphQL base http headers
    "apollographql-client-name",
    "apollographql-client-version",
    "Apollo-Require-Preflight",
    // Apollo GraphQL header for mobile clients
    "X-Apollo-Operation-Name",
    // Apollo GraphQL header to enable ApolloServerPluginInlineTrace
    "apollo-federation-include-trace",
  ],
};

export const corsMW = cors(corsOptions);
