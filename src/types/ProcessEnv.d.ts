export {};

declare global {
  namespace NodeJS {
    /**
     * process.env fields (see src/server/env)
     */
    interface ProcessEnv {
      NODE_ENV: "development" | "test" | "ci" | "staging" | "production";
      npm_package_version: string;
      PROTOCOL: string;
      DOMAIN: string;
      PORT: string;
      AWS_REGION: string;
      DYNAMODB_TABLE_NAME: string;
      JWT_PRIVATE_KEY: string;
      SENTRY_DSN: string;
      STRIPE_API_VERSION: string;
      STRIPE_WEBHOOKS_SECRET: string;
      STRIPE_PUBLISHABLE_KEY: string;
      STRIPE_SECRET_KEY: string;
      FIXIT_SUB_PRODUCT_ID: string;
      FIXIT_SUB_PRICES_JSON: string;
      FIXIT_SUB_PROMO_CODES_JSON: string;
    }
  }
}
