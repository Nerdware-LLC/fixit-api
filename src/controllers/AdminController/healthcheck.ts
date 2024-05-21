import type { ApiController } from "@/controllers/types.js";

/**
 * This controller responds to healthcheck requests.
 *
 * > Endpoint: `GET /api/admin/healthcheck`
 */
export const healthcheck: ApiController<"/admin/healthcheck", void> = (req, res, next) => {
  try {
    // Send response
    res.status(200).json({ message: "SUCCESS" });
  } catch (err) {
    next(err);
  }
};
