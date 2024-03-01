import helmet from "helmet";
import { ENV } from "@/server/env";
import type { RequestHandler } from "express";

/**
 * FIXIT CSP DIRECTIVE SOURCES
 */
const FIXIT_SOURCES = ["'self'", "gofixit.app", "*.gofixit.app"];

/**
 * Security Middleware: `setSecureHttpHeaders`
 *
 * This [Helmet](https://helmetjs.github.io/) config results in the CSP directives listed
 * below. These directives are a combination of helmet defaults, Stripe requirements, Google
 * API requirements, and Fixit-related sources.
 *
 * @see https://stripe.com/docs/security/guide#content-security-policy
 * @see https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#cross_origin_opener_policy
 *
 * - RESULTANT CSP DIRECTIVES:
 *   - default-src `'self' gofixit.app *.gofixit.app https://accounts.google.com/gsi/;`
 *   - base-uri `'self';`
 *   - connect-src `'self' gofixit.app *.gofixit.app https://accounts.google.com/gsi/ https://api.stripe.com;`
 *   - font-src `'self' https: data:;`
 *   - form-action `'self' gofixit.app *.gofixit.app;`
 *   - frame-ancestors `'self' gofixit.app *.gofixit.app;`
 *   - frame-src `https://accounts.google.com/gsi/ https://js.stripe.com https://hooks.stripe.com;`
 *   - img-src `'self' gofixit.app *.gofixit.app data: blob:;`
 *   - object-src `'none';`
 *   - report-to `fixit-security;`
 *   - report-uri `${ENV.CONFIG.API_FULL_URL}/admin/csp-violation;`
 *   - script-src `'self' gofixit.app *.gofixit.app https://accounts.google.com/gsi/client https://js.stripe.com;`
 *   - script-src-attr `'none';`
 *   - style-src `'self' gofixit.app *.gofixit.app https://accounts.google.com/gsi/style https: 'unsafe-inline';`
 *   - `upgrade-insecure-requests`
 */
const helmetMW = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": [...FIXIT_SOURCES, "https://accounts.google.com/gsi/"],
      "base-uri": "'self'",
      "connect-src": [...FIXIT_SOURCES, "https://accounts.google.com/gsi/", "https://api.stripe.com"], // prettier-ignore
      "font-src": ["'self'", "https:", "data:"],
      "form-action": [...FIXIT_SOURCES],
      "frame-ancestors": [...FIXIT_SOURCES],
      "frame-src": ["https://accounts.google.com/gsi/", "https://js.stripe.com", "https://hooks.stripe.com"], // prettier-ignore
      "img-src": [...FIXIT_SOURCES, "data:", "blob:"],
      "object-src": "'none'",
      "report-to": "fixit-security",
      "report-uri": `${ENV.CONFIG.API_FULL_URL}/admin/csp-violation`,
      "script-src": [...FIXIT_SOURCES, "https://accounts.google.com/gsi/client", "https://js.stripe.com"], // prettier-ignore
      "script-src-attr": "'none'",
      "style-src": [...FIXIT_SOURCES, "https://accounts.google.com/gsi/style", "https:", "'unsafe-inline'"], // prettier-ignore
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
