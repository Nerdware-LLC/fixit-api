import type { JsonValue } from "type-fest";

declare global {
  namespace NodeJS {
    /**
     * process.env fields read by the src/server/env module. These env vars are
     * often not provided in test and CI environments, and are therefore optional
     * (with the exception of NODE_ENV, which should always be defined).
     */
    interface ProcessEnv {
      NODE_ENV?: "development" | "test" | "ci" | "staging" | "production";
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
      GOOGLE_OAUTH_CLIENT_ID?: string;
      GOOGLE_OAUTH_CLIENT_SECRET?: string;
    }
  }

  /**
   * This declaration makes the following modifications to the `JSON.parse` typedef:
   *
   * - For the `text: string` argument overload, the `any` return type is replaced with
   *   {@link JsonValue | type-fest's `JsonValue`} .
   * - Add `number` overload, since `JSON.parse(42)` is valid and returns `42`.
   * - Add `null` overload, since `JSON.parse(null)` is valid and returns `null`.
   */
  interface JSON {
    parse(text: string, reviver?: (this: any, key: string, value: unknown) => unknown): JsonValue;
    parse(text: number, reviver?: (this: any, key: string, value: unknown) => unknown): number;
    parse(text: null, reviver?: (this: any, key: string, value: unknown) => unknown): null;
  }
}
