import type { EnvObject, EnvName } from "@types";
import type { Algorithm } from "jsonwebtoken";

const {
  NODE_ENV,
  npm_package_version,
  VITE_PROTOCOL = "http",
  VITE_DOMAIN = "localhost",
  VITE_PORT = "8080",
  VITE_AWS_REGION = "local",
  VITE_DYNAMODB_TABLE_NAME = "fixit-db-test",
  VITE_JWT_PRIVATE_KEY,
  VITE_JWT_ALGORITHM,
  VITE_STRIPE_WEBHOOKS_SECRET,
  VITE_STRIPE_PUBLISHABLE_KEY,
  VITE_STRIPE_SECRET_KEY,
  VITE_FIXIT_SUB_PRODUCT_ID,
  VITE_FIXIT_SUB_PRICES_JSON,
  VITE_FIXIT_SUB_PROMO_CODES_JSON,
} = process.env as Record<string, string>; // eslint-disable-line node/no-process-env

const FIXIT_SUB_PRICES = JSON.parse(VITE_FIXIT_SUB_PRICES_JSON) as {
  MONTHLY: string;
  ANNUAL: string;
};

const API_BASE_URL = `${VITE_PROTOCOL}://${VITE_DOMAIN}`;

export const ENV: EnvObject = Object.freeze({
  NODE_ENV: NODE_ENV as EnvName, // <-- should always be "test"
  IS_PROD: false,
  CONFIG: {
    PROJECT_VERSION: npm_package_version,
    TIMEZONE: `${new Date().toString().match(/([A-Z]+[+-][0-9]+.*)/)?.[1] ?? "FAILED_TO_OBTAIN_TIMEZONE"}`, // prettier-ignore
    PROTOCOL: VITE_PROTOCOL,
    DOMAIN: VITE_DOMAIN,
    PORT: VITE_PORT,
    API_BASE_URL,
    API_FULL_URL: `${API_BASE_URL}:${VITE_PORT}/api`,
    OS_PLATFORM: process.platform,
    PID: process.pid,
    NODE_VERSION: process.version,
    CWD: process.cwd(),
  },
  AWS: {
    REGION: VITE_AWS_REGION,
    DYNAMODB_TABLE_NAME: VITE_DYNAMODB_TABLE_NAME,
  },
  SECURITY: {
    JWT_PRIVATE_KEY: VITE_JWT_PRIVATE_KEY,
    JWT_ALGORITHM: VITE_JWT_ALGORITHM as Algorithm,
  },
  STRIPE: {
    WEBHOOKS_SECRET: VITE_STRIPE_WEBHOOKS_SECRET,
    PUBLISHABLE_KEY: VITE_STRIPE_PUBLISHABLE_KEY,
    SECRET_KEY: VITE_STRIPE_SECRET_KEY,
    BILLING: {
      FIXIT_SUBSCRIPTION: {
        productID: VITE_FIXIT_SUB_PRODUCT_ID,
        priceIDs: {
          TRIAL: FIXIT_SUB_PRICES.MONTHLY,
          ...FIXIT_SUB_PRICES,
        },
        promoCodes: JSON.parse(VITE_FIXIT_SUB_PROMO_CODES_JSON) as Record<string, string>,
      },
    },
  },
});
