import helmet from "helmet";
import { ENV } from "@/server/env";
import type { RequestHandler } from "express";

/**
 * This file contains Express middleware that sets HTTP headers with the intent
 * of hardening the application's security posture, as well as approximating the
 * headers actually returned to clients in deployed environments. In practice,
 * live deployments operate behind various infrastructure components that override
 * request+response headers.
 */

// CSP DIRECTIVE SOURCES
const SELF = "'self'";
const API_CSP_SOURCE = `${ENV.CONFIG.API_BASE_URL}/`;
const API_CSP_REPORT_URI = `${ENV.CONFIG.API_BASE_URL}/admin/csp-violation`;
const GOOGLE_GSI = "https://accounts.google.com/gsi/";
const GOOGLE_GSI_CLIENT = "https://accounts.google.com/gsi/client";
const GOOGLE_GSI_STYLE = "https://accounts.google.com/gsi/style";
const STRIPE_API = "https://api.stripe.com";
const STRIPE_HOOKS = "https://hooks.stripe.com";
const STRIPE_JS = "https://js.stripe.com";
const SENTRY_INGEST = "https://*.ingest.sentry.io/";

/**
 * This [Helmet][helmet-url] config produces a CSP that reflects a variety of sources:
 *
 * - Fixit-related sources
 * - [Stripe requirements][stripe-csp]
 * - [Google API requirements][google-api-csp]
 * - Sentry reporting
 *
 * [helmet-url]: https://helmetjs.github.io/
 * [stripe-csp]: https://stripe.com/docs/security/guide#content-security-policy
 * [google-api-csp]: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#cross_origin_opener_policy
 */
const helmetMW = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": [SELF, ENV.WEB_CLIENT.URL, GOOGLE_GSI],
      "base-uri": SELF,
      "connect-src": [SELF, API_CSP_SOURCE, SENTRY_INGEST, GOOGLE_GSI, STRIPE_API],
      "font-src": [SELF, "https:", "data:"],
      "form-action": [SELF, API_CSP_SOURCE],
      "frame-ancestors": [SELF, ENV.WEB_CLIENT.URL],
      "frame-src": [GOOGLE_GSI, STRIPE_JS, STRIPE_HOOKS],
      "img-src": [ENV.WEB_CLIENT.URL, "data:", "blob:"],
      "object-src": "'none'",
      "report-to": "fixit-security",
      "report-uri": API_CSP_REPORT_URI,
      "script-src": [SELF, ENV.WEB_CLIENT.URL, GOOGLE_GSI_CLIENT, STRIPE_JS],
      "script-src-attr": "'none'",
      "style-src": [SELF, ENV.WEB_CLIENT.URL, GOOGLE_GSI_STYLE, "https:", "'unsafe-inline'"],
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
    "Report-To": `{"group":"fixit-security","max_age":10886400,"url":"${API_CSP_REPORT_URI}"}`,
  });

  helmetMW(req, res, next);
};
