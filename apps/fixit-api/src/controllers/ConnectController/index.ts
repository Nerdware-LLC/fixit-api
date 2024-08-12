import { createAccountLink } from "./createAccountLink.js";
import { createDashboardLink } from "./createDashboardLink.js";

/**
 * This object contains request/response handlers for `/api/connect/*` routes.
 */
export const ConnectController = {
  createAccountLink,
  createDashboardLink,
} as const;
