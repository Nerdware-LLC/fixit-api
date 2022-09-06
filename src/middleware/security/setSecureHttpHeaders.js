import helmet from "helmet";
import { ENV } from "@server/env";

export const setSecureHttpHeaders = (req, res, next) => {
  res.set({
    "Cache-Control": "no-store",
    "Report-To": REPORT_TO
  });
  helmetMW(req, res, next);
};

const VIOLATION_REPORTS_URI = `${ENV.CONFIG.SELF_URI}/admin/csp-violation`;
const REPORT_TO = JSON.stringify({
  group: "fixit-security",
  max_age: 10886400,
  url: VIOLATION_REPORTS_URI
});
const TRUSTED = ["'self'", `'${ENV.CONFIG.SELF_URI}'`];

const helmetMW = helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(), // see below
      "default-src": TRUSTED,
      "report-uri": [VIOLATION_REPORTS_URI], // deprecated, but as of Feb 2021 most browsers don't yet support the new 'report-to' directive
      "report-to": ["fixit-security"],
      "script-src": TRUSTED
    }
  }
});

// HELMET'S DEFAULT CSP DIRECTIVES:
//
// default-src 'self';
// base-uri 'self';
// block-all-mixed-content;
// font-src 'self' https: data:;
// frame-ancestors 'self';
// img-src 'self' data:;
// object-src 'none';
// script-src 'self';
// script-src-attr 'none';
// style-src 'self' https: 'unsafe-inline';
// upgrade-insecure-requests
