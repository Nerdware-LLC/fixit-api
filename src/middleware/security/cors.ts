import cors from "cors";
import { ENV } from "@server/env";

const corsOptions = {
  origin: [new RegExp(`^${ENV.CONFIG.SELF_URI}`), "https://studio.apollographql.com"],
  allowedHeaders: ["Content-Type", "Authorization", "apollographql-client-name"]
};

export const corsMW = cors(corsOptions);
