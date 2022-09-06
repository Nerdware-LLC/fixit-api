import express from "express";
import { reportCspViolation } from "@middleware";

export const adminRouter = express.Router();

// req.baseUrl = "/admin"

adminRouter.use("/healthcheck", express.json(), (req, res) => {
  res.json({ message: "SUCESS" });
});

adminRouter.use(
  "/csp-violation",
  express.json({
    type: ["application/json", "application/csp-report", "application/reports+json"]
  }),
  reportCspViolation
);
