import helmet from "helmet";
import { ENV } from "@/server/env";
import type { RequestHandler } from "express";

/**
 * HELMET'S DEFAULT CSP DIRECTIVES:
 *
 * - default-src 'self';
 * - base-uri 'self';
 * - block-all-mixed-content;
 * - font-src 'self' https: data:;
 * - frame-ancestors 'self';
 * - img-src 'self' data:;
 * - object-src 'none';
 * - script-src 'self';
 * - script-src-attr 'none';
 * - style-src 'self' https: 'unsafe-inline';
 * - upgrade-insecure-requests
 */
const HELMET_DEFAULT_CSP_DIRECTIVES = helmet.contentSecurityPolicy.getDefaultDirectives() as Record<
  string,
  string[]
>;

/**
 * STRIPE'S REQUIRED CSP DIRECTIVES:
 *
 * The directives listed below are required in order for fixit-web to use the stripeJS lib.
 * https://stripe.com/docs/security/guide#content-security-policy
 *
 * - connect-src 'https://api.stripe.com';
 * - frame-src 'https://js.stripe.com' 'https://hooks.stripe.com';
 * - script-src 'https://js.stripe.com';
 */
const STRIPE_REQUIRED_CSP_DIRECTIVES = {
  "connect-src": "https://api.stripe.com",
  "frame-src": ["https://js.stripe.com", "https://hooks.stripe.com"],
  "script-src": "https://js.stripe.com",
};

/**
 * CSP VIOLATION REPORTING DIRECTIVES:
 *
 * - report-to 'fixit-security';
 * - report-uri `${ENV.CONFIG.API_FULL_URL}/admin/csp-violation`;
 *
 * > "report-uri" has been deprecated, but as of Nov 2022 most browsers don't
 *   yet support the new 'report-to' directive (still experimental in Chrome).
 */
const CSP_VIOLATION_REPORTING_DIRECTIVES = {
  "report-uri": `${ENV.CONFIG.API_FULL_URL}/admin/csp-violation`,
  "report-to": "fixit-security",
};

/**
 * FIXIT API SRC CSP DIRECTIVES:
 *
 * - default-src `'${ENV.CONFIG.API_BASE_URL}'`;
 * - script-src `'${ENV.CONFIG.API_BASE_URL}'`;
 */
const FIXIT_API_SRC_CSP_DIRECTIVES = {
  "default-src": `'${ENV.CONFIG.API_BASE_URL}'`,
  "script-src": `'${ENV.CONFIG.API_BASE_URL}'`,
};

/**
 * Security Middleware: `setSecureHttpHeaders`
 *
 * HELMET HTTP HEADERS (https://helmetjs.github.io/)
 *
 * The Helmet config results in the combined set of CSP directives listed below.
 * These directives are a combination of helmet defaults, Stripe requirements,
 * and custom Fixit-related sources.
 *
 * CSP DIRECTIVES:
 *
 * - default-src `'self' '${ENV.CONFIG.API_BASE_URL}';`
 * - script-src `'self' '${ENV.CONFIG.API_BASE_URL}' 'https://js.stripe.com';`
 * - script-src-attr `'none';`
 * - frame-src `'https://js.stripe.com' 'https://hooks.stripe.com';`
 * - frame-ancestors `'self';`
 * - connect-src `'https://api.stripe.com';`
 * - base-uri `'self';`
 * - font-src `'self' https: data:;`
 * - img-src `'self' data:;`
 * - object-src `'none';`
 * - style-src `'self' https: 'unsafe-inline';`
 * - report-to `'fixit-security';`
 * - report-uri `'${ENV.CONFIG.API_FULL_URL}/admin/csp-violation';`
 * - `block-all-mixed-content;`
 * - `upgrade-insecure-requests;`
 */
const helmetMW = helmet({
  contentSecurityPolicy: {
    directives: [
      HELMET_DEFAULT_CSP_DIRECTIVES,
      FIXIT_API_SRC_CSP_DIRECTIVES,
      CSP_VIOLATION_REPORTING_DIRECTIVES,
      STRIPE_REQUIRED_CSP_DIRECTIVES,
    ].reduce<Record<string, string[]>>((accum, cspDirectivesObject) => {
      // Deep merge each set of CSP directives
      Object.entries(cspDirectivesObject).forEach(([cspKey, cspValues]) => {
        // Wrap single cspValue strings in an array
        if (!Array.isArray(cspValues)) cspValues = [cspValues] as Array<string>;
        // Add the cspKey if it hasn't already been added; merge in cspValues.
        if (cspKey in accum) accum[cspKey].concat(cspValues);
        else accum[cspKey] = cspValues;
      });
      return accum;
    }, {}),
  },
});

/**
 * `setSecureHttpHeaders` uses Helmet to set security-related HTTP headers.
 *
 * See `helmetMW` for a breakdown of the `Content-Security-Policy` directives.
 *
 * Aside from the Helmet-defaults, a list of which is available [here](https://helmetjs.github.io/),
 * this middleware also sets the following headers:
 *
 * - Cache-Control: `no-store`
 * - Report-To:
 *    ```json
 *    {
 *      "group": "fixit-security",
 *      "max_age": 10886400,
 *      "url": "${ENV.CONFIG.API_FULL_URL}/admin/csp-violation"
 *    }
 *    ```
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
  url: CSP_VIOLATION_REPORTING_DIRECTIVES["report-uri"],
});
