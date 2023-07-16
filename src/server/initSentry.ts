import * as Sentry from "@sentry/node";
import { ENV } from "@server/env";

// TODO Add support for uploading source maps to Sentry (see link below).
// https://docs.sentry.io/platforms/node/sourcemaps/uploading/typescript/?original_referrer=https%3A%2F%2Fwww.google.com%2F

Sentry.init({
  enabled: /^(dev|staging|prod)/i.test(ENV.NODE_ENV) && !!ENV?.SENTRY_DSN,
  dsn: ENV?.SENTRY_DSN,
  environment: ENV.NODE_ENV,
  release: ENV.CONFIG.PROJECT_VERSION,
  tracesSampleRate: 1.0,
});
