const {
  NODE_ENV,
  npm_package_version,
  PROTOCOL,
  DOMAIN,
  PORT,
  AWS_REGION,
  DYNAMODB_TABLE_NAME,
  APOLLO_STUDIO_INTROSPECTION_AUTH_TOKEN,
  JWT_PRIVATE_KEY,
  JWT_ALGORITHM,
  SENTRY_DSN,
  STRIPE_API_VERSION,
  STRIPE_WEBHOOKS_SECRET,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
  FIXIT_SUB_PRODUCT_ID,
  FIXIT_SUB_PRICES_JSON,
  FIXIT_SUB_PROMO_CODES_JSON,
} = process.env; // eslint-disable-line node/no-process-env

const FIXIT_SUB_PRICES = JSON.parse(FIXIT_SUB_PRICES_JSON) as {
  MONTHLY: string;
  ANNUAL: string;
};

const API_BASE_URL = `${PROTOCOL}://${DOMAIN}`;

export const ENV = Object.freeze({
  NODE_ENV,
  IS_PROD: /^prod/i.test(NODE_ENV),
  CONFIG: {
    PROJECT_VERSION: npm_package_version,
    // prettier-ignore
    TIMEZONE: `${new Date().toString().match(/([A-Z]+[+-][0-9]+.*)/)?.[1] ?? "FAILED_TO_OBTAIN_TIMEZONE"}`,
    PROTOCOL,
    DOMAIN,
    PORT,
    API_BASE_URL,
    API_FULL_URL: `${API_BASE_URL}:${PORT}/api`,
    OS_PLATFORM: process.platform,
    PID: process.pid,
    NODE_VERSION: process.version,
    CWD: process.cwd(),
  },
  AWS: {
    REGION: AWS_REGION,
    DYNAMODB_TABLE_NAME,
  },
  SECURITY: {
    JWT_PRIVATE_KEY,
    JWT_ALGORITHM,
    ...(NODE_ENV === "development" && { APOLLO_STUDIO_INTROSPECTION_AUTH_TOKEN }),
  },
  SENTRY_DSN,
  STRIPE: {
    API_VERSION: STRIPE_API_VERSION,
    // WEBHOOKS SECRETS
    WEBHOOKS_SECRET: STRIPE_WEBHOOKS_SECRET,
    // STRIPE KEYS
    PUBLISHABLE_KEY: STRIPE_PUBLISHABLE_KEY,
    SECRET_KEY: STRIPE_SECRET_KEY,
    // STRIPE IDs
    BILLING: {
      FIXIT_SUBSCRIPTION: {
        productID: FIXIT_SUB_PRODUCT_ID,
        priceIDs: {
          TRIAL: FIXIT_SUB_PRICES.MONTHLY,
          ...FIXIT_SUB_PRICES,
        },
        promoCodes: JSON.parse(FIXIT_SUB_PROMO_CODES_JSON) as Record<string, string>,
      },
    },
  },
});
