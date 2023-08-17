import type { Algorithm } from "jsonwebtoken";

/**
 * Represents an object that stores environment variables used throughout
 * the application.
 *
 * The 'EnvObject' class ensures that all necessary environment variables are
 * provided and parses some of them to create new fields. It provides read-only
 * access to these variables and their values.
 *
 * @constructor
 * @param {Object} process.env - The environment variables object.
 * @throws {Error} Throws an error if any required environment variables are missing.
 *
 * @property {string} NODE_ENV - The current environment (development, test, ci, staging, or production).
 * @property {boolean} IS_PROD - Indicates whether the current environment is production.
 * @property {Object} CONFIG - Config-related env vars.
 * @property {Object} AWS - AWS-related env vars.
 * @property {Object} JWT - JWT-related env vars.
 * @property {string} SENTRY_DSN - The Sentry DSN.
 * @property {Object} STRIPE - Stripe-related env vars.
 */
export class EnvObject {
  readonly NODE_ENV: "development" | "test" | "ci" | "staging" | "production";
  readonly IS_PROD: boolean;
  readonly CONFIG: Readonly<{
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
  }>;
  readonly AWS: Readonly<{
    REGION: string;
    DYNAMODB_TABLE_NAME: string;
  }>;
  readonly JWT: Readonly<{
    PRIVATE_KEY: string;
    ALGORITHM: Algorithm;
    ISSUER: string;
    EXPIRES_IN: string;
  }>;
  readonly BCRYPT_SALT_ROUNDS: number;
  readonly SENTRY_DSN: string;
  readonly STRIPE: Readonly<{
    WEBHOOKS_SECRET: string;
    PUBLISHABLE_KEY: string;
    SECRET_KEY: string;
    BILLING: Readonly<{
      FIXIT_SUBSCRIPTION: Readonly<{
        productID: string;
        promoCodes: Record<string, string>;
        priceIDs: Record<"TRIAL" | "MONTHLY" | "ANNUAL", string>;
      }>;
    }>;
  }>;

  constructor({
    NODE_ENV,
    npm_package_version,
    PROTOCOL,
    DOMAIN,
    PORT,
    AWS_REGION,
    DYNAMODB_TABLE_NAME,
    JWT_PRIVATE_KEY,
    JWT_ALGORITHM,
    JWT_ISSUER,
    JWT_EXPIRES_IN,
    BCRYPT_SALT_ROUNDS,
    SENTRY_DSN,
    STRIPE_WEBHOOKS_SECRET,
    STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY,
    FIXIT_SUB_PRODUCT_ID,
    FIXIT_SUB_PRICES_JSON,
    FIXIT_SUB_PROMO_CODES_JSON,
  }: typeof process.env) {
    // Ensure necessary env vars have been provided
    if (
      !NODE_ENV ||
      !npm_package_version ||
      !PROTOCOL ||
      !DOMAIN ||
      !PORT ||
      !AWS_REGION ||
      !DYNAMODB_TABLE_NAME ||
      !JWT_PRIVATE_KEY ||
      !JWT_ALGORITHM ||
      !JWT_ISSUER ||
      !JWT_EXPIRES_IN ||
      !BCRYPT_SALT_ROUNDS ||
      !SENTRY_DSN ||
      !STRIPE_WEBHOOKS_SECRET ||
      !STRIPE_PUBLISHABLE_KEY ||
      !STRIPE_SECRET_KEY ||
      !FIXIT_SUB_PRODUCT_ID ||
      !FIXIT_SUB_PRICES_JSON ||
      !FIXIT_SUB_PROMO_CODES_JSON
    ) {
      throw new Error("Missing required environment variables.");
    }

    // Ensure the provided JWT_ALGORITHM is supported
    if (!/^[HRE]S(256|384|512)$/.test(JWT_ALGORITHM)) {
      throw new Error("Unsupported JWT_ALGORITHM");
    }

    const API_BASE_URL = `${PROTOCOL}://${DOMAIN}`;

    const FIXIT_SUB_PRICES = JSON.parse(FIXIT_SUB_PRICES_JSON) as {
      MONTHLY: string;
      ANNUAL: string;
    };

    this.NODE_ENV = NODE_ENV;
    this.IS_PROD = /^prod/i.test(NODE_ENV);
    this.CONFIG = {
      PROJECT_VERSION: `v${npm_package_version}`,
      TIMEZONE: `${new Date().toString().match(/([A-Z]+[+-][0-9]+.*)/)?.[1] ?? "-"}`,
      PROTOCOL,
      DOMAIN,
      PORT,
      API_BASE_URL,
      API_FULL_URL: `${API_BASE_URL}:${PORT}/api`,
      OS_PLATFORM: process.platform,
      PID: process.pid,
      NODE_VERSION: process.version,
      CWD: process.cwd(),
    };
    this.AWS = {
      REGION: AWS_REGION,
      DYNAMODB_TABLE_NAME,
    };
    this.JWT = {
      PRIVATE_KEY: JWT_PRIVATE_KEY,
      ALGORITHM: JWT_ALGORITHM as Algorithm,
      ISSUER: JWT_ISSUER,
      EXPIRES_IN: JWT_EXPIRES_IN,
    };
    this.BCRYPT_SALT_ROUNDS = parseInt(BCRYPT_SALT_ROUNDS, 10);
    this.SENTRY_DSN = SENTRY_DSN;
    this.STRIPE = {
      WEBHOOKS_SECRET: STRIPE_WEBHOOKS_SECRET,
      PUBLISHABLE_KEY: STRIPE_PUBLISHABLE_KEY,
      SECRET_KEY: STRIPE_SECRET_KEY,
      BILLING: {
        FIXIT_SUBSCRIPTION: {
          productID: FIXIT_SUB_PRODUCT_ID,
          promoCodes: JSON.parse(FIXIT_SUB_PROMO_CODES_JSON) as Record<string, string>,
          priceIDs: {
            TRIAL: FIXIT_SUB_PRICES.MONTHLY,
            ...FIXIT_SUB_PRICES,
          },
        },
      },
    };
  }
}
