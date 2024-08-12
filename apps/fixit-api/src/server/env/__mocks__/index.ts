import { createEnvObject } from "../helpers.js";

/*
  The default values below are for unit-testing contexts wherein the underlying
  services/APIs are mocked and the execution environment lacks one or more env
  vars. For integration/e2e tests, these values can be provided as needed.
*/

const {
  npm_package_version,
  // SERVER
  VITE_PROTOCOL: PROTOCOL = "http",
  VITE_DOMAIN: DOMAIN = "localhost",
  VITE_PORT: PORT = "0",
  // WEB CLIENT
  VITE_WEB_CLIENT_URL: WEB_CLIENT_URL = "http://localhost:3000",
  // AWS
  VITE_AWS_REGION: AWS_REGION = "local",
  VITE_DYNAMODB_REGION: DYNAMODB_REGION = "local",
  VITE_DYNAMODB_TABLE_NAME: DYNAMODB_TABLE_NAME = "fixit-db-test",
  VITE_DYNAMODB_ENDPOINT: DYNAMODB_ENDPOINT = "http://localhost:8000",
  VITE_PINPOINT_PROJECT_ID: PINPOINT_PROJECT_ID = "TestTestTest",
  VITE_SES_EMAIL_ADDRESS: SES_EMAIL_ADDRESS = "test@test.test",
  // AUTH
  VITE_JWT_PRIVATE_KEY: JWT_PRIVATE_KEY = "TestTestTest",
  VITE_JWT_ALGORITHM: JWT_ALGORITHM = "HS256",
  VITE_JWT_ISSUER: JWT_ISSUER = "TestTestTest",
  VITE_JWT_EXPIRES_IN: JWT_EXPIRES_IN = "5m",
  VITE_BCRYPT_SALT_ROUNDS: BCRYPT_SALT_ROUNDS = "10",
  VITE_UUID_NAMESPACE: UUID_NAMESPACE = "aaaaaaaa-aaaa-5aaa-8aaa-aaaaaaaaaaaa", // 5=version, 8=variant
  // SENTRY
  VITE_SENTRY_DSN: SENTRY_DSN,
  // STRIPE
  VITE_STRIPE_API_VERSION: STRIPE_API_VERSION = "2022-08-01",
  VITE_STRIPE_PUBLISHABLE_KEY: STRIPE_PUBLISHABLE_KEY = "pk_fake_TestTestTest",
  VITE_STRIPE_SECRET_KEY: STRIPE_SECRET_KEY = "sk_fake_TestTestTest",
  VITE_STRIPE_WEBHOOKS_SECRET: STRIPE_WEBHOOKS_SECRET = "whsec_TestTestTest",
  // GOOGLE
  VITE_GOOGLE_OAUTH_CLIENT_ID: GOOGLE_OAUTH_CLIENT_ID = "TestTestTest.apps.googleusercontent.com",
  VITE_GOOGLE_OAUTH_CLIENT_SECRET: GOOGLE_OAUTH_CLIENT_SECRET = "TestTestTest",
} = process.env; // eslint-disable-line node/no-process-env

export const ENV = createEnvObject({
  ...(!!npm_package_version && { npm_package_version }),
  NODE_ENV: "test",
  PROTOCOL,
  DOMAIN,
  PORT,
  WEB_CLIENT_URL,
  AWS_REGION,
  DYNAMODB_REGION,
  DYNAMODB_TABLE_NAME,
  DYNAMODB_ENDPOINT,
  PINPOINT_PROJECT_ID,
  SES_EMAIL_ADDRESS,
  JWT_PRIVATE_KEY,
  JWT_ALGORITHM,
  JWT_ISSUER,
  JWT_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
  UUID_NAMESPACE,
  SENTRY_DSN,
  STRIPE_API_VERSION,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOKS_SECRET,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
});
