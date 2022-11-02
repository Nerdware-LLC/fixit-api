/* eslint-disable node/no-process-env */
const {
  NODE_ENV,
  npm_package_version,
  SELF_URI,
  PORT,
  AWS_REGION,
  DYNAMODB_TABLE_NAME,
  JWT_PRIVATE_KEY,
  SENTRY_DSN,
  STRIPE_API_VERSION,
  STRIPE_WEBHOOKS_SECRET,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
  FIXIT_SUB_PRODUCT_ID,
  FIXIT_SUB_PRICE_ID_MONTHLY,
  FIXIT_SUB_PRICE_ID_ANNUAL,
  STRIPE_VIP_PROMO_CODE,
  STRIPE_VIP_PROMO_CODE_ID
} = process.env;

export const ENV = Object.freeze({
  NODE_ENV,
  IS_PROD: NODE_ENV === "production",
  CONFIG: {
    PROJECT_VERSION: npm_package_version,
    // prettier-ignore
    TIMEZONE: `${new Date().toString().match(/([A-Z]+[+-][0-9]+.*)/)?.[1] ?? "FAILED_TO_OBTAIN_TIMEZONE"}`,
    SELF_URI,
    PORT,
    API_FULL_URL: `${SELF_URI}:${PORT}/api`,
    OS_PLATFORM: process.platform,
    PID: process.pid,
    NODE_VERSION: process.version,
    CWD: process.cwd()
  },
  AWS: {
    REGION: AWS_REGION,
    DYNAMODB_TABLE_NAME
  },
  SECURITY: {
    JWT_PRIVATE_KEY
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
          TRIAL: FIXIT_SUB_PRICE_ID_MONTHLY,
          MONTHLY: FIXIT_SUB_PRICE_ID_ANNUAL,
          ANNUAL: FIXIT_SUB_PRICE_ID_ANNUAL
        },
        promoCodes: {
          [STRIPE_VIP_PROMO_CODE]: STRIPE_VIP_PROMO_CODE_ID
        }
      }
    }
  }
});
