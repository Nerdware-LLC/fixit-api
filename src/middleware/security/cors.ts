import cors from "cors";
import { ENV } from "@server/env";

const corsOptions = {
  origin: [
    new RegExp(`^${ENV.CONFIG.API_BASE_URL}`),
    "https://studio.apollographql.com",
    ...(/^(dev|test)/.test(ENV.NODE_ENV) ? [/localhost/] : [])
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
    // Enable ApolloServerPluginInlineTrace in dev:
    ...(ENV.NODE_ENV === "development" ? ["apollo-federation-include-trace"] : [])
  ]
};

export const corsMW = cors(corsOptions);
