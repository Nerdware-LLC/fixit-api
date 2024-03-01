import type { Algorithm } from "jsonwebtoken";

/**
 * @returns a readonly `ENV` object with environment variables used throughout the application.
 * @throws an error if required env vars are missing, or if certain env var values are invalid.
 */
export const createEnvObject = ({
  npm_package_version,
  NODE_ENV,
  PROTOCOL,
  DOMAIN,
  PORT,
  AWS_REGION,
  DYNAMODB_TABLE_NAME,
  DYNAMODB_ENDPOINT,
  JWT_PRIVATE_KEY,
  JWT_ALGORITHM,
  JWT_ISSUER,
  JWT_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
  SENTRY_DSN,
  STRIPE_API_VERSION,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOKS_SECRET,
}: typeof process.env) => {
  // Ensure necessary env vars have been provided
  if (
    !NODE_ENV ||
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
    !STRIPE_API_VERSION ||
    !STRIPE_PUBLISHABLE_KEY ||
    !STRIPE_SECRET_KEY ||
    !STRIPE_WEBHOOKS_SECRET
  ) {
    throw new Error("Missing required environment variables.");
  }

  // Ensure the provided JWT_ALGORITHM is supported
  if (!/^[HRE]S(256|384|512)$/.test(JWT_ALGORITHM)) {
    throw new Error("Unsupported JWT_ALGORITHM");
  }

  const API_BASE_URL = `${PROTOCOL}://${DOMAIN}`;

  return {
    NODE_ENV,
    IS_PROD: /^prod/i.test(NODE_ENV),
    CONFIG: {
      ...(npm_package_version && { PROJECT_VERSION: `v${npm_package_version}` }),
      TIMEZONE: new Date().toString().match(/([A-Z]+[+-][0-9]+.*)/)?.[1] ?? "-",
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
      ...(DYNAMODB_ENDPOINT && { DYNAMODB_ENDPOINT }),
    },
    JWT: {
      PRIVATE_KEY: JWT_PRIVATE_KEY,
      ALGORITHM: JWT_ALGORITHM as Algorithm,
      ISSUER: JWT_ISSUER,
      EXPIRES_IN: JWT_EXPIRES_IN,
    },
    BCRYPT_SALT_ROUNDS: parseInt(BCRYPT_SALT_ROUNDS, 10),
    SENTRY_DSN,
    STRIPE: {
      API_VERSION: STRIPE_API_VERSION,
      PUBLISHABLE_KEY: STRIPE_PUBLISHABLE_KEY,
      SECRET_KEY: STRIPE_SECRET_KEY,
      WEBHOOKS_SECRET: STRIPE_WEBHOOKS_SECRET,
    },
  } as const;
};
