import * as Sentry from "@sentry/node";
import "@sentry/tracing"; // <-- patches the global hub for tracing to work
import { ENV } from "@server/env";

Sentry.init({
  dsn: ENV.SENTRY_DSN,
  environment: ENV.NODE_ENV,
  release: ENV.CONFIG.PROJECT_VERSION
});
