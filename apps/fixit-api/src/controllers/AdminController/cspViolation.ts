import { sanitizeJsonString } from "@nerdware/ts-string-helpers";
import { safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { logger } from "@/utils/logger.js";
import type { ApiRequestHandler } from "@/controllers/ApiController.js";

/**
 * This controller handles CSP-violation-report requests.
 *
 * > Endpoint: `POST /api/admin/csp-violation`
 *
 * > **For the structure of the CSP-report object, see [MDN Sample CSP Violation Report][mdn-sample-report].**
 *
 * [mdn-sample-report]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only#sample_violation_report
 */
export const cspViolation: ApiRequestHandler<"/admin/csp-violation"> = (req, res, next) => {
  try {
    // Sanitize the CSP-report json:
    const sanitizedJsonStr = sanitizeJsonString(safeJsonStringify(req.body));

    // Parse the sanitized JSON string:
    try {
      const report = JSON.parse(sanitizedJsonStr);
      logger.security(report, "CSP VIOLATION REPORT");
    } catch {
      logger.security(sanitizedJsonStr, "CSP VIOLATION REPORT (RECEIVED INVALID JSON)");
    }

    // Send 204 (No Content) response:
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
