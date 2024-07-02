import type { JsonValue } from "type-fest";

declare global {
  namespace NodeJS {
    /**
     * process.env fields read by the src/server/env module. These env vars are
     * often not provided in test and CI environments, and are therefore optional
     * (with the exception of NODE_ENV, which should always be defined).
     */
    interface ProcessEnv {
      NODE_ENV?: "development" | "test" | "staging" | "production" | undefined;
      npm_package_version?: string | undefined;
      // SERVER
      PROTOCOL?: string | undefined;
      DOMAIN?: string | undefined;
      PORT?: string | undefined;
      // WEB CLIENT
      WEB_CLIENT_URL?: string | undefined;
      // AWS
      AWS_REGION?: string | undefined;
      DYNAMODB_REGION?: string | undefined;
      DYNAMODB_TABLE_NAME?: string | undefined;
      DYNAMODB_ENDPOINT?: string | undefined;
      PINPOINT_PROJECT_ID?: string | undefined;
      SES_EMAIL_ADDRESS?: string | undefined;
      // AUTH
      JWT_PRIVATE_KEY?: string | undefined;
      JWT_ALGORITHM?: string | undefined;
      JWT_ISSUER?: string | undefined;
      JWT_EXPIRES_IN?: string | undefined;
      BCRYPT_SALT_ROUNDS?: string | undefined;
      UUID_NAMESPACE?: string | undefined;
      // SENTRY
      SENTRY_DSN?: string | undefined;
      // STRIPE
      STRIPE_WEBHOOKS_SECRET?: string | undefined;
      STRIPE_PUBLISHABLE_KEY?: string | undefined;
      STRIPE_SECRET_KEY?: string | undefined;
      // GOOGLE
      GOOGLE_OAUTH_CLIENT_ID?: string | undefined;
      GOOGLE_OAUTH_CLIENT_SECRET?: string | undefined;
    }
  }

  /**
   * This declaration makes the following modifications to the `JSON.parse` typedef:
   *
   * - For the `text: string` argument overload, the `any` return type is replaced with {@link JsonValue}.
   * - Add `number` overload, since `JSON.parse(42)` is valid and returns `42`.
   * - Add `null` overload, since `JSON.parse(null)` is valid and returns `null`.
   */
  interface JSON {
    parse(text: string, reviver?: JsonParseReviver): JsonValue;
    parse(text: number, reviver?: JsonParseReviver): number;
    parse(text: null, reviver?: JsonParseReviver): null;
  }

  type JsonParseReviver = (this: typeof JSON, key: string, value: unknown) => unknown;
}
