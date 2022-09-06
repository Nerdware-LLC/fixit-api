import * as Sentry from "@sentry/node";
import { ENV } from "@server/env";

Sentry.init({
  dsn: ENV.SENTRY_DSN,
  environment: ENV.NODE_ENV,
  release: ENV.CONFIG.PROJECT_VERSION
});
