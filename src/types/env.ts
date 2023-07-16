import type { Algorithm } from "jsonwebtoken";
import type { ReadonlyDeep } from "type-fest";

export type EnvName = "development" | "test" | "ci" | "staging" | "production";

export type EnvObject = ReadonlyDeep<{
  NODE_ENV: EnvName;
  IS_PROD: boolean;
  CONFIG: {
    PROJECT_VERSION: string;
    TIMEZONE: string;
    PROTOCOL: string;
    DOMAIN: string;
    PORT: string;
    API_BASE_URL: string;
    API_FULL_URL: string;
    OS_PLATFORM: string;
    PID: number;
    NODE_VERSION: string;
    CWD: string;
  };
  AWS: {
    REGION: string;
    DYNAMODB_TABLE_NAME: string;
  };
  SECURITY: {
    JWT_PRIVATE_KEY: string;
    JWT_ALGORITHM: Algorithm;
  };
  SENTRY_DSN?: string | undefined;
  STRIPE: {
    WEBHOOKS_SECRET: string;
    PUBLISHABLE_KEY: string;
    SECRET_KEY: string;
    BILLING: {
      FIXIT_SUBSCRIPTION: {
        productID: string;
        priceIDs: {
          TRIAL: string;
          MONTHLY: string;
          ANNUAL: string;
        };
        promoCodes: Record<string, string>;
      };
    };
  };
}>;
