import helmet from "helmet";
import { ENV } from "@/server/env";
import type { RequestHandler } from "express";

/**
 * FIXIT CSP DIRECTIVE SOURCES
 */
const FIXIT_SOURCES = {
  WEB: ["'self'", "https://gofixit.app", "https://*.gofixit.app"],
  API: ["'self'", "https://gofixit.app/", "https://*.gofixit.app/"],
} as const;

/**
 * Security Middleware: `setSecureHttpHeaders`
 *
 * This [Helmet][helmet-url] config produces a secure `Content-Security-Policy` which serves as a
 * strong mitigation against [cross-site scripting attacks][google-xss-info]. The resultant CSP has
 * been evaluated using https://csp-evaluator.withgoogle.com/.
 *
 * These directives reflect a combination of sources:
 *
 * - HelmetJS defaults
 * - [Stripe requirements][stripe-csp]
 * - [Google API requirements][google-api-csp]
 * - Fixit-related sources
 *
 * [helmet-url]: https://helmetjs.github.io/
 * [google-xss-info]: https://www.google.com/about/appsecurity/learning/xss/
 * [stripe-csp]: https://stripe.com/docs/security/guide#content-security-policy
 * [google-api-csp]: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#cross_origin_opener_policy
 */
const helmetMW = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": [...FIXIT_SOURCES.WEB, "https://accounts.google.com/gsi/"],
      "base-uri": "'self'",
      "connect-src": [...FIXIT_SOURCES.API, "https://*.ingest.sentry.io/", "https://accounts.google.com/gsi/", "https://api.stripe.com"], // prettier-ignore
      "font-src": ["'self'", "https:", "data:"],
      "form-action": [...FIXIT_SOURCES.API],
      "frame-ancestors": [...FIXIT_SOURCES.WEB],
      "frame-src": ["https://accounts.google.com/gsi/", "https://js.stripe.com", "https://hooks.stripe.com"], // prettier-ignore
      "img-src": [...FIXIT_SOURCES.WEB, "data:", "blob:"],
      "object-src": "'none'",
      "report-to": "fixit-security",
      "report-uri": `${ENV.CONFIG.API_FULL_URL}/admin/csp-violation`,
      "script-src": [...FIXIT_SOURCES.WEB, "https://accounts.google.com/gsi/client", "https://js.stripe.com"], // prettier-ignore
      "script-src-attr": "'none'",
      "style-src": [...FIXIT_SOURCES.WEB, "https://accounts.google.com/gsi/style", "https:", "'unsafe-inline'"], // prettier-ignore
      "upgrade-insecure-requests": [],
    },
  },
});

/**
 * `setSecureHttpHeaders` uses Helmet to set security-related HTTP headers.
 */
export const setSecureHttpHeaders: RequestHandler = (req, res, next) => {
  res.set({
    "Cache-Control": "no-store",
    "Report-To": REPORT_TO_HTTP_HEADER_VALUE_JSON,
  });

  helmetMW(req, res, next);
};

const REPORT_TO_HTTP_HEADER_VALUE_JSON = JSON.stringify({
  group: "fixit-security",
  max_age: 10886400,
  url: `${ENV.CONFIG.API_FULL_URL}/admin/csp-violation`,
});
