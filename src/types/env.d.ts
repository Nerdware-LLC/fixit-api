export {};

// Ambient definitions
declare global {
  namespace NodeJS {
    // For process.env values
    export interface ProcessEnv {
      NODE_ENV: "development" | "test" | "ci" | "staging" | "production";
      npm_package_version: string;
      SELF_URI: string;
      PORT: string;
      AWS_REGION: string;
      DYNAMODB_TABLE_NAME: string;
      JWT_PRIVATE_KEY: string;
      SENTRY_DSN: string;
      STRIPE_API_VERSION: string;
      STRIPE_PUBLISHABLE_KEY: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_CONNECT_ONBOARDING_REDIRECT_ROUTE: string;
      STRIPE_CUSTOMER_PORTAL_REDIRECT_ROUTE: string;
      FIXIT_SUB_productID: string;
      FIXIT_SUB_priceID_MONTHLY: string;
      FIXIT_SUB_priceID_ANNUAL: string;
      STRIPE_VIP_PROMO_CODE: string;
      STRIPE_VIP_PROMO_CODE_ID: string;
    }
  }

  // Global fallback definition for errors
  export type ErrorLike = Error | string | any;
}
