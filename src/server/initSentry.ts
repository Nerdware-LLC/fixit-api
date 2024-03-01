import * as Sentry from "@sentry/node";
import { ENV } from "@/server/env";

if (/^(dev|staging|prod)/i.test(ENV.NODE_ENV) && !!ENV?.SENTRY_DSN) {
  Sentry.init({
    enabled: true,
    dsn: ENV.SENTRY_DSN,
    environment: ENV.NODE_ENV,
    tracesSampleRate: 1.0,
    ...(!!ENV.CONFIG?.PROJECT_VERSION && { release: ENV.CONFIG.PROJECT_VERSION }),
  });
}
