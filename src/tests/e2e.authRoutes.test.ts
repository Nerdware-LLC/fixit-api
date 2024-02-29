import { isString, isPlainObject } from "@nerdware/ts-type-safety-utils";
import request from "supertest";
import { expressApp } from "@/expressApp.js";
import { usersCache } from "@/lib/cache/usersCache.js";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { User } from "@/models/User/User.js";
import { USER_ID_REGEX } from "@/models/User/regex.js";
import { ddbTable } from "@/models/ddbTable.js";
import { ENV } from "@/server/env/index.js";
import {
  MOCK_USERS,
  MOCK_CONTACTS,
  MOCK_WORK_ORDERS,
  MOCK_INVOICES,
  MOCK_USER_SUBS,
  UNALIASED_MOCK_USERS,
  UNALIASED_MOCK_USER_SCAs,
  UNALIASED_MOCK_USER_SUBS,
  UNALIASED_MOCK_CONTACTS,
  UNALIASED_MOCK_WORK_ORDERS,
  UNALIASED_MOCK_INVOICES,
  MOCK_USER_SCAs,
} from "@/tests/staticMockItems/index.js";
import { AuthToken } from "@/utils/AuthToken.js";
import { passwordHasher } from "@/utils/passwordHasher.js";
import type { Server } from "http";

vi.mock("@/apolloServer.js");

describe("[e2e] Server Requests /api/auth/*", () => {
  let server: Server;

  beforeAll(() => {
    server = expressApp.listen(ENV.CONFIG.PORT);
  });

  afterAll(() => {
    server.close();
  });

  describe("POST /api/auth/register", () => {
    test("returns a valid Fixit AuthToken in response body", async () => {
      // Mock client request args to provide in req.body:
      const MOCK_REGISTER_REQUEST_ARGS = {
        handle: "@mock_user",
        email: "mock_user@gmail.com",
        phone: "(123) 456-7890",
        type: "LOCAL",
        password: "MockPassword@1",
      };
      // Mock StripeAPI values returned by below stubs:
      const MOCK_STRIPE_CUSTOMER_ID = "cus_TestTestTest";
      const MOCK_STRIPE_CONNECT_ACCOUNT_ID = "acct_TestTestTest";

      // Stub empty response from User.query in findUserByEmail middleware
      vi.spyOn(User, "query").mockResolvedValueOnce([]);

      // Stub stripe.customers.create for invocation in User.createOne method
      vi.spyOn(stripe.customers, "create").mockResolvedValueOnce({
        id: MOCK_STRIPE_CUSTOMER_ID,
      } as any);

      // Stub stripe.accounts.create for invocation in UserStripeConnectAccount.createOne method
      vi.spyOn(stripe.accounts, "create").mockResolvedValueOnce({
        id: MOCK_STRIPE_CONNECT_ACCOUNT_ID,
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,
      } as any);

      // Send the request
      const response = await request(expressApp)
        .post("/api/auth/register")
        .send(MOCK_REGISTER_REQUEST_ARGS);

      // Assert the response
      expect(response.statusCode).toBe(200);
      assert(isString(response.body?.token), "response.body.token is not a string");

      // Assert the token payload
      const tokenPayload = await AuthToken.validateAndDecodeAuthToken(response.body.token);

      expect(tokenPayload).toStrictEqual({
        id: expect.stringMatching(USER_ID_REGEX),
        handle: MOCK_REGISTER_REQUEST_ARGS.handle,
        email: MOCK_REGISTER_REQUEST_ARGS.email,
        phone: MOCK_REGISTER_REQUEST_ARGS.phone,
        profile: { displayName: MOCK_REGISTER_REQUEST_ARGS.handle },
        stripeCustomerID: MOCK_STRIPE_CUSTOMER_ID,
        stripeConnectAccount: {
          id: MOCK_STRIPE_CONNECT_ACCOUNT_ID,
          detailsSubmitted: false,
          chargesEnabled: false,
          payoutsEnabled: false,
        },
        createdAt: expect.toBeValidDate(),
        updatedAt: expect.toBeValidDate(),
      });
    });
  });

  describe("POST /api/auth/login", () => {
    test("returns a valid Fixit AuthToken and pre-fetched user-items in response body", async () => {
      // Arrange mock client request args to provide in req.body:
      const MOCK_LOGIN_REQUEST_ARGS = {
        email: MOCK_USERS.USER_A.email,
        password: "MockPassword@1",
      };

      // Stub the User.query in findUserByEmail middleware
      vi.spyOn(User, "query").mockResolvedValueOnce([MOCK_USERS.USER_A]);
      // Stub the passwordHasher.validate response in validatePassword middleware
      vi.spyOn(passwordHasher, "validate").mockResolvedValueOnce(true);
      // Stub ddbTable.ddbClient.query response in queryUserItems middleware
      vi.spyOn(ddbTable.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [
          UNALIASED_MOCK_USERS.USER_A,
          UNALIASED_MOCK_USER_SCAs.SCA_A,
          UNALIASED_MOCK_USER_SUBS.SUB_A,
          UNALIASED_MOCK_CONTACTS.CONTACT_A,
          UNALIASED_MOCK_WORK_ORDERS.WO_A,
          UNALIASED_MOCK_INVOICES.INV_A,
        ],
      });
      // Stub usersCache.get response in queryUserItems middleware
      vi.spyOn(usersCache, "get").mockReturnValueOnce(MOCK_USERS.USER_B);
      // Stub User.updateItem into a no-op in updateExpoPushToken middleware
      vi.spyOn(User, "updateItem").mockResolvedValueOnce({} as any);

      // Send the request
      const { status, body: responseBody } = await request(expressApp)
        .post("/api/auth/login")
        .send(MOCK_LOGIN_REQUEST_ARGS);

      // Assert the response
      expect(status).toBe(200);
      assert(isString(responseBody?.token), "response.body.token is not present");
      assert(isPlainObject(responseBody?.userItems), "response.body.userItems is not present");

      // Assert the token payload
      const tokenPayload = await AuthToken.validateAndDecodeAuthToken(responseBody.token);

      expect(tokenPayload).toStrictEqual({
        id: expect.stringMatching(USER_ID_REGEX),
        handle: MOCK_USERS.USER_A.handle,
        email: MOCK_LOGIN_REQUEST_ARGS.email,
        phone: MOCK_USERS.USER_A.phone,
        profile: MOCK_USERS.USER_A.profile,
        stripeCustomerID: MOCK_USERS.USER_A.stripeCustomerID,
        stripeConnectAccount: {
          id: MOCK_USER_SCAs.SCA_A.id,
          detailsSubmitted: true,
          chargesEnabled: true,
          payoutsEnabled: true,
        },
        subscription: {
          id: MOCK_USER_SUBS.SUB_A.id,
          status: "active",
          currentPeriodEnd: expect.toBeValidDate(),
        },
        createdAt: expect.toBeValidDate(),
        updatedAt: expect.toBeValidDate(),
      });

      // Expected userItems:
      const {
        createdByUserID: WO_A_createdByUserID,
        assignedToUserID: WO_A_assignedToUserID, // null
        ...WO_A_fields
      } = MOCK_WORK_ORDERS.WO_A;
      const {
        createdByUserID: INV_A_createdByUserID,
        assignedToUserID: INV_A_assignedToUserID,
        workOrderID: INV_A_workOrderID, // null
        ...INV_A_fields
      } = MOCK_INVOICES.INV_A;

      // Assert the pre-fetched userItems
      expect(responseBody.userItems).toStrictEqual({
        workOrders: [
          expect.objectContaining({
            ...WO_A_fields,
            createdBy: { id: WO_A_createdByUserID },
            assignedTo: null,
            createdAt: expect.toBeValidDate(),
            updatedAt: expect.toBeValidDate(),
          }),
        ],
        invoices: [
          expect.objectContaining({
            ...INV_A_fields,
            createdBy: { id: INV_A_createdByUserID },
            assignedTo: { id: INV_A_assignedToUserID },
            workOrder: INV_A_workOrderID, // null
            createdAt: expect.toBeValidDate(),
            updatedAt: expect.toBeValidDate(),
          }),
        ],
        contacts: [
          expect.objectContaining({
            id: MOCK_CONTACTS.CONTACT_A.id,
            handle: MOCK_CONTACTS.CONTACT_A.handle,
            email: MOCK_USERS.USER_B.email,
            phone: MOCK_USERS.USER_B.phone,
            profile: MOCK_USERS.USER_B.profile,
            createdAt: expect.toBeValidDate(),
            updatedAt: expect.toBeValidDate(),
          }),
        ],
      });
    });
  });

  describe("POST /api/auth/token", () => {
    test("returns a valid Fixit AuthToken and pre-fetched user-items in response body", async () => {
      // Create mock AuthToken for Auth header
      const mockAuthToken = new AuthToken({
        ...MOCK_USERS.USER_A,
        stripeConnectAccount: MOCK_USER_SCAs.SCA_A,
        subscription: MOCK_USER_SUBS.SUB_A,
      });

      // Stub ddbTable.ddbClient.query response in queryUserItems middleware
      vi.spyOn(ddbTable.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [
          UNALIASED_MOCK_USERS.USER_A,
          UNALIASED_MOCK_USER_SCAs.SCA_A,
          UNALIASED_MOCK_USER_SUBS.SUB_A,
          UNALIASED_MOCK_CONTACTS.CONTACT_A,
          UNALIASED_MOCK_WORK_ORDERS.WO_A,
          UNALIASED_MOCK_INVOICES.INV_A,
        ],
      });
      // Stub usersCache.get response in queryUserItems middleware
      vi.spyOn(usersCache, "get").mockReturnValueOnce(MOCK_USERS.USER_B);
      // Stub User.updateItem into a no-op in updateExpoPushToken middleware
      vi.spyOn(User, "updateItem").mockResolvedValueOnce({} as any);

      // Send the request
      const { status, body: responseBody } = await request(expressApp)
        .post("/api/auth/token")
        .set("Authorization", `Bearer ${mockAuthToken.toString()}`);

      // Assert the response
      expect(status).toBe(200);
      assert(isString(responseBody?.token), "response.body.token is not present");
      assert(isPlainObject(responseBody?.userItems), "response.body.userItems is not present");

      // Assert the token payload
      const tokenPayload = await AuthToken.validateAndDecodeAuthToken(responseBody.token);
      expect(tokenPayload).toStrictEqual({
        id: expect.stringMatching(USER_ID_REGEX),
        handle: MOCK_USERS.USER_A.handle,
        email: MOCK_USERS.USER_A.email,
        phone: MOCK_USERS.USER_A.phone,
        profile: MOCK_USERS.USER_A.profile,
        stripeCustomerID: MOCK_USERS.USER_A.stripeCustomerID,
        stripeConnectAccount: {
          id: UNALIASED_MOCK_USER_SCAs.SCA_A.data,
          detailsSubmitted: true,
          chargesEnabled: true,
          payoutsEnabled: true,
        },
        subscription: {
          id: UNALIASED_MOCK_USER_SUBS.SUB_A.data,
          status: "active",
          currentPeriodEnd: expect.toBeValidDate(),
        },
        createdAt: expect.toBeValidDate(),
        updatedAt: expect.toBeValidDate(),
      });

      // Expected userItems:
      const {
        createdByUserID: WO_A_createdByUserID,
        assignedToUserID: WO_A_assignedToUserID, // null
        ...WO_A_fields
      } = MOCK_WORK_ORDERS.WO_A;
      const {
        createdByUserID: INV_A_createdByUserID,
        assignedToUserID: INV_A_assignedToUserID,
        workOrderID: INV_A_workOrderID, // null
        ...INV_A_fields
      } = MOCK_INVOICES.INV_A;

      // Assert the pre-fetched userItems
      expect(responseBody.userItems).toStrictEqual({
        workOrders: [
          expect.objectContaining({
            ...WO_A_fields,
            createdBy: { id: WO_A_createdByUserID },
            assignedTo: null,
            createdAt: expect.toBeValidDate(),
            updatedAt: expect.toBeValidDate(),
          }),
        ],
        invoices: [
          expect.objectContaining({
            ...INV_A_fields,
            createdBy: { id: INV_A_createdByUserID },
            assignedTo: { id: INV_A_assignedToUserID },
            workOrder: INV_A_workOrderID, // null
            createdAt: expect.toBeValidDate(),
            updatedAt: expect.toBeValidDate(),
          }),
        ],
        contacts: [
          expect.objectContaining({
            id: MOCK_CONTACTS.CONTACT_A.id,
            handle: MOCK_CONTACTS.CONTACT_A.handle,
            email: MOCK_USERS.USER_B.email,
            phone: MOCK_USERS.USER_B.phone,
            profile: MOCK_USERS.USER_B.profile,
            createdAt: expect.toBeValidDate(),
            updatedAt: expect.toBeValidDate(),
          }),
        ],
      });
    });
  });
});
