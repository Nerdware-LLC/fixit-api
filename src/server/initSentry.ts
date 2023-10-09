import * as Sentry from "@sentry/node";
import { ENV } from "@/server/env";

Sentry.init({
  enabled: /^(dev|staging|prod)/i.test(ENV.NODE_ENV) && !!ENV?.SENTRY_DSN,
  dsn: ENV?.SENTRY_DSN,
  environment: ENV.NODE_ENV,
  release: ENV.CONFIG?.PROJECT_VERSION,
  tracesSampleRate: 1.0,
});
