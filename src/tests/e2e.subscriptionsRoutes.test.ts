import { isString } from "@nerdware/ts-type-safety-utils";
import request from "supertest";
import { httpServer, type HttpServerWithCustomStart } from "@/httpServer.js";
import { isValidStripeID } from "@/lib/stripe/helpers.js";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { SUBSCRIPTION_PRICE_NAMES as SUB_PRICE_NAMES } from "@/models/UserSubscription/enumConstants.js";
import { AuthToken } from "@/services/AuthService/AuthToken.js";
import { MOCK_USERS, MOCK_USER_SUBS, MOCK_USER_SCAs } from "@/tests/staticMockItems";

vi.mock("@/apolloServer.js");

describe("[e2e][Server Requests] Routes /api/subscriptions/*", () => {
  let server: HttpServerWithCustomStart;

  beforeAll(async () => {
    server = await httpServer.start(0);
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
        subscription: null, // No subscription yet
      });

      // Stub stripe.paymentMethods.attach response in CheckoutService.processPayment
      vi.spyOn(stripe.paymentMethods, "attach").mockResolvedValueOnce(undefined as any);
      // Stub stripe.customers.update response in CheckoutService.processPayment
      vi.spyOn(stripe.customers, "update").mockResolvedValueOnce({
        subscriptions: { data: [] },
      } as any);
      // Ensure manual ddbDocClient stubs are used for upserting the UserSub
      vi.mock("@aws-sdk/lib-dynamodb"); // <repo_root>/__mocks__/@aws-sdk/lib-dynamodb.ts

      // Send the request
      const { status, body: responseBody } = await request(httpServer)
        .post("/api/subscriptions/submit-payment")
        .set("Authorization", `Bearer ${mockAuthToken.toString()}`)
        .send({ selectedSubscription: SUB_PRICE_NAMES.ANNUAL, paymentMethodID: "pm_TestTestTest" });

      // Assert the response
      expect(status).toBe(201);
      assert(isString(responseBody?.token), "response.body.token is not present");

      // Assert the token payload
      const tokenPayload = await AuthToken.validateAndDecode(responseBody.token);
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
      const { status, body: responseBody } = await request(httpServer)
        .post("/api/subscriptions/customer-portal")
        .set("Authorization", `Bearer ${mockAuthToken.toString()}`)
        .send({ returnURL: "https://mock-return-url.com" });

      // Assert the response
      expect(status).toBe(201);
      expect(responseBody).toStrictEqual({ stripeLink: mockStripeLink });
    });
  });
});
