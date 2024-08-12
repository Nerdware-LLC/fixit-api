import type { ApiRequestHandler } from "@/controllers/ApiController.js";

/**
 * This controller responds to healthcheck requests.
 *
 * > Endpoint: `GET /api/admin/healthcheck`
 */
export const healthcheck: ApiRequestHandler<"/admin/healthcheck"> = (req, res, next) => {
  try {
    res.status(200).json({ message: "SUCCESS" });
  } catch (err) {
    next(err);
  }
};
