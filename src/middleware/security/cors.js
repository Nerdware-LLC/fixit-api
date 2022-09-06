import cors from "cors";
import { ENV } from "@server/env";

const LOCAL_ORIGINS = [/^http:\/\/localhost:3000/, /^http:\/\/192\.168\.1\.122:3000/];

const ENV_ORIGINS_ALLOWLIST = {
  development: LOCAL_ORIGINS,
  test: LOCAL_ORIGINS,
  staging: [], // FIXME
  production: [] // FIXME
};

if (!Object.keys(ENV_ORIGINS_ALLOWLIST).includes(ENV.NODE_ENV)) {
  throw new Error(`CORS config does not recognize this NODE_ENV: ${ENV.NODE_ENV}`);
}

const corsOptions = {
  origin: [...ENV_ORIGINS_ALLOWLIST[ENV.NODE_ENV], "https://studio.apollographql.com"],
  allowedHeaders: ["Content-Type", "Authorization", "apollographql-client-name"]
};

export const corsMW = cors(corsOptions);
