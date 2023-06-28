import express from "express";
import { logger, hasKey } from "@utils";
import type { Request } from "express";
import type { JsonObject } from "type-fest";

/**
 * This router handles all requests to the "/api/admin" path.
 *
 * - `req.baseUrl` = "/api/admin"
 *
 * Descendant paths:
 * - `/api/admin/healthcheck`
 * - `/api/admin/csp-violation`
 *
 * Example CSP-violation report:
 * ```json
 * {
 *   "csp-report": {
 *     "document-uri": "http://localhost:5500/",
 *     "referrer": "",
 *     "violated-directive": "script-src-elem",
 *     "effective-directive": "script-src-elem",
 *     "original-policy": "default-src 'self'; font-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'; report-uri /__cspreport__;",
 *     "disposition": "report",
 *     "blocked-uri": "inline",
 *     "line-number": 58,
 *     "source-file": "http://localhost:5500/",
 *     "status-code": 200,
 *     "script-sample": ""
 *   }
 * }
 * ```
 */
export const adminRouter = express.Router();

adminRouter.use("/healthcheck", express.json(), (req, res) => {
  res.json({ message: "SUCESS" });
});

adminRouter.use(
  "/csp-violation",
  express.json({
    type: ["application/json", "application/csp-report", "application/reports+json"],
  }),
  (
    req: Request<
      unknown,
      unknown,
      { "csp-report"?: JsonObject | string | undefined; [K: string]: unknown }
    >,
    res
  ) => {
    const report = hasKey(req.body, "csp-report") ? req.body["csp-report"] : { ...req.body };

    logger.security(report, "CSP VIOLATION REPORT");
    res.end();
  }
);
