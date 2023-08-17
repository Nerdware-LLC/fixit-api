import { EnvObject } from "../EnvObject";

/*
  The default values below are for unit-testing contexts wherein the underlying
  services/APIs are mocked and the execution environment lacks one or more env
  vars. For integration/e2e tests, these values can be provided as needed.
*/

const {
  NODE_ENV,
  npm_package_version,
  VITE_PROTOCOL: PROTOCOL = "http",
  VITE_DOMAIN: DOMAIN = "localhost",
  VITE_PORT: PORT = "0",
  VITE_AWS_REGION: AWS_REGION = "local",
  VITE_DYNAMODB_TABLE_NAME: DYNAMODB_TABLE_NAME = "fixit-db-test",
  VITE_JWT_PRIVATE_KEY: JWT_PRIVATE_KEY = "TestTestTest",
  VITE_JWT_ALGORITHM: JWT_ALGORITHM = "HS256",
  VITE_JWT_ISSUER: JWT_ISSUER = "TestTestTest",
  VITE_JWT_EXPIRES_IN: JWT_EXPIRES_IN = "5m",
  VITE_BCRYPT_SALT_ROUNDS: BCRYPT_SALT_ROUNDS = "10",
  VITE_SENTRY_DSN: SENTRY_DSN = "TestTestTest",
  VITE_STRIPE_WEBHOOKS_SECRET: STRIPE_WEBHOOKS_SECRET = "whsec_TestTestTest",
  VITE_STRIPE_PUBLISHABLE_KEY: STRIPE_PUBLISHABLE_KEY = "pk_fake_TestTestTest",
  VITE_STRIPE_SECRET_KEY: STRIPE_SECRET_KEY = "sk_fake_TestTestTest",
  VITE_FIXIT_SUB_PRODUCT_ID: FIXIT_SUB_PRODUCT_ID = "prod_TestTestTest",
  VITE_FIXIT_SUB_PROMO_CODES_JSON: FIXIT_SUB_PROMO_CODES_JSON = `{"TEST":"promo_TestTestTest"}`,
  VITE_FIXIT_SUB_PRICES_JSON:
    FIXIT_SUB_PRICES_JSON = `{"ANNUAL":"price_TestANNUAL","MONTHLY":"price_TestMONTHLY"}`,
} = process.env; // eslint-disable-line node/no-process-env

export const ENV = new EnvObject({
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
});
