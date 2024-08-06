import request from "supertest";
import { httpServer, type HttpServerWithCustomStart } from "@/httpServer.js";

vi.mock("@/apolloServer.js");

describe("[e2e][Server Requests] Routes /api/admin/*", () => {
  let server: HttpServerWithCustomStart;

  beforeAll(async () => {
    server = await httpServer.start(0);
  });

  afterAll(() => {
    server.close();
  });

  describe("GET /api/admin/healthcheck", () => {
    test(`returns "SUCCESS" message in request body`, async () => {
      const response = await request(httpServer).get("/api/admin/healthcheck");

      expect(response.statusCode).toBe(200);
      expect(response.body?.message).toBe("SUCCESS");
    });
  });

  describe("POST /api/admin/csp-violation", () => {
    test("returns response status code 204", async () => {
      const response = await request(httpServer)
        .post("/api/admin/csp-violation")
        .send({
          "csp-report": JSON.stringify({ "csp-report": "MOCK_CSP_VIOLATION_REPORT" }),
        });
      expect(response.statusCode).toBe(204);
    });
  });
});
