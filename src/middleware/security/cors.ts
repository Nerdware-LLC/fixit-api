import cors from "cors";
import { ENV } from "@server/env";

const corsOptions = {
  origin: [
    new RegExp(`^${ENV.CONFIG.API_BASE_URL}`),
    "https://studio.apollographql.com",
    ...(/^(dev|test)/.test(ENV.NODE_ENV) ? [/localhost/] : []),
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
    // dev env headers:
    ...(ENV.NODE_ENV === "development"
      ? [
          // Enable ApolloServerPluginInlineTrace
          "apollo-federation-include-trace",
          // Permit access to Apollo Studio queries
          "Apollo-Studio-Auth-Token",
        ]
      : []),
  ],
};

export const corsMW = cors(corsOptions);
