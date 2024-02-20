import { isString } from "@nerdware/ts-type-safety-utils";
import request from "supertest";
import { expressApp } from "@/expressApp";
import { stripe, isValidStripeID } from "@/lib/stripe";
import { ENV } from "@/server/env";
import { MOCK_USERS, MOCK_USER_SUBS, MOCK_USER_SCAs } from "@/tests/staticMockItems";
import { AuthToken } from "@/utils/AuthToken";
import type { Server } from "http";

vi.mock("@/apolloServer");

describe("[e2e][Server Requests] Routes /api/subscriptions/*", () => {
  let server: Server;

  beforeAll(() => {
    server = expressApp.listen(ENV.CONFIG.PORT);
  });

  afterAll(() => {
    server.close();
  });

  describe("POST /api/subscriptions/submit-payment", () => {
    test("creates a subscription and returns an updated AuthToken", async () => {
      // Create mock AuthToken for Auth header
      const mockAuthToken = new AuthToken({
        ...MOCK_USERS.USER_A,
        stripeConnectAccount: MOCK_USER_SCAs.SCA_A,
        // No "subscription" field here - User doesn't yet have a sub.
      });

      // Stub stripe.paymentMethods.attach response for findOrCreateStripeSubscription
      vi.spyOn(stripe.paymentMethods, "attach").mockResolvedValueOnce(undefined as any);
      // Stub stripe.customers.update response for findOrCreateStripeSubscription
      vi.spyOn(stripe.customers, "update").mockResolvedValueOnce({
        subscriptions: { data: [] },
      } as any);
      // Ensure manual ddbDocClient stubs are used for UserSubscription.upsertOne
      vi.mock("@aws-sdk/lib-dynamodb"); // <repo_root>/__mocks__/@aws-sdk/lib-dynamodb.ts

      // Send the request
      const { status, body: responseBody } = await request(expressApp)
        .post("/api/subscriptions/submit-payment")
        .set("Authorization", `Bearer ${mockAuthToken.toString()}`)
        .send({ selectedSubscription: "ANNUAL", paymentMethodID: "pm_TestTestTest" });

      // Assert the response
      expect(status).toBe(200);
      assert(isString(responseBody?.token), "response.body.token is not present");

      // Assert the token payload
      const tokenPayload = await AuthToken.validateAndDecodeAuthToken(responseBody.token);
      expect(tokenPayload).toStrictEqual({
        id: MOCK_USERS.USER_A.id,
        handle: MOCK_USERS.USER_A.handle,
        email: MOCK_USERS.USER_A.email,
        phone: MOCK_USERS.USER_A.phone,
        profile: MOCK_USERS.USER_A.profile,
        stripeCustomerID: expect.toSatisfyFn((value) => isValidStripeID.customer(value)),
        stripeConnectAccount: {
          id: expect.toSatisfyFn((value) => isValidStripeID.connectAccount(value)),
          detailsSubmitted: true,
          chargesEnabled: true,
          payoutsEnabled: true,
        },
        createdAt: expect.toBeValidDate(),
        updatedAt: expect.toBeValidDate(),
        // AuthToken payload should NOW have subscription info:
        subscription: {
          id: expect.toSatisfyFn((value) => isValidStripeID.subscription(value)),
          status: "active",
          currentPeriodEnd: expect.toBeValidDate(),
        },
      });
    });
  });

  describe("POST /api/subscriptions/customer-portal", () => {
    test("returns a valid Stripe BillingPortalSession Link in response body", async () => {
      // Create mock AuthToken for Auth header
      const mockAuthToken = new AuthToken({
        ...MOCK_USERS.USER_A,
        stripeConnectAccount: MOCK_USER_SCAs.SCA_A,
        subscription: MOCK_USER_SUBS.SUB_A,
      });

      const mockStripeLink = "https://billing.stripe.com/session/TestTestTest";

      // Stub stripe.billingPortal.sessions.create response
      vi.spyOn(stripe.billingPortal.sessions, "create").mockResolvedValueOnce({
        url: mockStripeLink,
      } as any);

      // Send the request
      const { status, body: responseBody } = await request(expressApp)
        .post("/api/subscriptions/customer-portal")
        .set("Authorization", `Bearer ${mockAuthToken.toString()}`)
        .send({ returnURL: "https://mock-return-url.com" });

      // Assert the response
      expect(status).toBe(200);
      expect(responseBody).toStrictEqual({ stripeLink: mockStripeLink });
    });
  });
});
