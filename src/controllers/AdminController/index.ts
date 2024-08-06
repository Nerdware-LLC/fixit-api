import { cspViolation } from "./cspViolation.js";
import { healthcheck } from "./healthcheck.js";

/**
 * This object contains request/response handlers for `/api/admin/*` routes.
 */
export const AdminController = {
  cspViolation,
  healthcheck,
} as const;
