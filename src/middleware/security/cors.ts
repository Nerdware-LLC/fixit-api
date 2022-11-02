import cors from "cors";
import { ENV } from "@server/env";

const corsOptions = {
  origin: [new RegExp(`^${ENV.CONFIG.API_FULL_URL}`), "https://studio.apollographql.com"],
  allowedHeaders: ["Content-Type", "Authorization", "apollographql-client-name"]
};

export const corsMW = cors(corsOptions);
