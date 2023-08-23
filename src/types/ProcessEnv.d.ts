export {};

declare global {
  namespace NodeJS {
    /**
     * process.env fields read by the src/server/env module. These env vars are
     * often not provided in test and CI environments, and are therefore optional
     * on the `process.env` object.
     */
    interface ProcessEnv {
      NODE_ENV: "development" | "test" | "ci" | "staging" | "production";
      npm_package_version?: string;
      PROTOCOL?: string;
      DOMAIN?: string;
      PORT?: string;
      AWS_REGION?: string;
      DYNAMODB_TABLE_NAME?: string;
      DYNAMODB_ENDPOINT?: string;
      JWT_PRIVATE_KEY?: string;
      JWT_ALGORITHM?: string;
      JWT_ISSUER?: string;
      JWT_EXPIRES_IN?: string;
      BCRYPT_SALT_ROUNDS?: string;
      SENTRY_DSN?: string;
      STRIPE_WEBHOOKS_SECRET?: string;
      STRIPE_PUBLISHABLE_KEY?: string;
      STRIPE_SECRET_KEY?: string;
      FIXIT_SUB_PRODUCT_ID?: string;
      FIXIT_SUB_PRICES_JSON?: string;
      FIXIT_SUB_PROMO_CODES_JSON?: string;
    }
  }
}
