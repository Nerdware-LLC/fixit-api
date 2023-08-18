import request from "supertest";
import { ENV } from "@/server/env";
import { expressApp } from "../expressApp";
import type { Server } from "http";

vi.mock("@/apolloServer");

describe("[e2e][Server Requests] Routes /api/admin/*", () => {
  let server: Server;

  beforeAll(() => {
    server = expressApp.listen(ENV.CONFIG.PORT);
  });

  afterAll(() => {
    server.close();
  });

  describe("GET /api/admin/healthcheck", () => {
    test(`returns "SUCCESS" message in request body`, async () => {
      const response = await request(expressApp).get("/api/admin/healthcheck");
      expect(response.statusCode).toBe(200);
      expect(response.body?.message).toBe("SUCESS");
    });
  });

  describe("POST /api/admin/csp-violation", () => {
    test("returns response status code 200", async () => {
      const response = await request(expressApp)
        .post("/api/admin/csp-violation")
        .send({
          "csp-report": JSON.stringify({ "csp-report": "MOCK_CSP_VIOLATION_REPORT" }),
        });
      expect(response.statusCode).toBe(200);
    });
  });
});
