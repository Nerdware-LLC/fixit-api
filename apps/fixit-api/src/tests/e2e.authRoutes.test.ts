import { isString, isPlainObject } from "@nerdware/ts-type-safety-utils";
import request from "supertest";
import { httpServer, type HttpServerWithCustomStart } from "@/httpServer.js";
import { usersCache } from "@/lib/cache/usersCache.js";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { User, userModelHelpers } from "@/models/User";
import { ddbTable } from "@/models/ddbTable.js";
import { AuthService } from "@/services/AuthService";
import { AuthToken } from "@/services/AuthService/AuthToken.js";
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
} from "@/tests/staticMockItems";
import { JWT } from "@/utils/jwt.js";
import { passwordHasher } from "@/utils/passwordHasher.js";

vi.mock("@/apolloServer.js");

describe("[e2e] Server Requests /api/auth/*", () => {
  let server: HttpServerWithCustomStart;

  beforeAll(async () => {
    server = await httpServer.start(0);
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
        password: "MockPassword@1",
      };
      // Mock StripeAPI values returned by below stubs:
      const MOCK_STRIPE_CUSTOMER_ID = "cus_TestTestTest";
      const MOCK_STRIPE_CONNECT_ACCOUNT_ID = "acct_TestTestTest";

      // Stub empty response from User.query in UserService.registerNewUser method
      vi.spyOn(User, "query").mockResolvedValueOnce([]);

      // Stub stripe.customers.create for invocation in UserService.registerNewUser method
      vi.spyOn(stripe.customers, "create").mockResolvedValueOnce({
        id: MOCK_STRIPE_CUSTOMER_ID,
      } as any);

      // Stub stripe.accounts.create for invocation in UserSCAService.registerNewUserSCA method
      vi.spyOn(stripe.accounts, "create").mockResolvedValueOnce({
        id: MOCK_STRIPE_CONNECT_ACCOUNT_ID,
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,
      } as any);

      // Send the request
      const response = await request(httpServer)
        .post("/api/auth/register")
        .send(MOCK_REGISTER_REQUEST_ARGS);

      // Assert the response
      expect(response.statusCode).toBe(201);
      assert(isString(response.body?.token), "response.body.token is not a string");

      // Assert the token payload
      const tokenPayload = await AuthToken.validateAndDecode(response.body.token);

      expect(tokenPayload).toStrictEqual({
        id: expect.stringMatching(userModelHelpers.id.regex),
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
        subscription: null,
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

      // Stub the User.query in the find-User-by-email logic
      vi.spyOn(User, "query").mockResolvedValueOnce([MOCK_USERS.USER_A]);
      // Stub the passwordHasher.validate response in validate-password logic
      vi.spyOn(passwordHasher, "validate").mockResolvedValueOnce(true);
      // Stub ddbTable.ddbClient.query response in query-UserItems logic
      vi.spyOn(ddbTable.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [
          UNALIASED_MOCK_USERS.USER_A,
          UNALIASED_MOCK_USER_SCAs.SCA_A,
          UNALIASED_MOCK_USER_SUBS.SUB_A,
          UNALIASED_MOCK_CONTACTS.CONTACT_A,
          UNALIASED_MOCK_WORK_ORDERS.WO_A,
          UNALIASED_MOCK_WORK_ORDERS.WO_B,
          UNALIASED_MOCK_INVOICES.INV_A,
          UNALIASED_MOCK_INVOICES.INV_B,
        ],
      });
      // Stub usersCache.get response in queryUserItems fn
      vi.spyOn(usersCache, "get").mockReturnValueOnce(MOCK_USERS.USER_B);
      // Stub User.updateItem into a no-op in update-ExpoPushToken logic
      vi.spyOn(User, "updateItem").mockResolvedValueOnce({} as any);

      // Send the request
      const { status, body: responseBody } = await request(httpServer)
        .post("/api/auth/login")
        .send(MOCK_LOGIN_REQUEST_ARGS);

      // Assert the response
      expect(status).toBe(200);
      assert(isString(responseBody?.token), "response.body.token is not present");
      assert(isPlainObject(responseBody?.userItems), "response.body.userItems is not present");

      // Assert the token payload
      const tokenPayload = await AuthToken.validateAndDecode(responseBody.token);

      expect(tokenPayload).toStrictEqual({
        id: expect.stringMatching(userModelHelpers.id.regex),
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

      // Expected WO+INV userItems:
      const {
        createdByUserID: WO_A_createdByUserID,
        assignedToUserID: _WO_A_assignedToUserID, // null
        ...WO_A_fields
      } = MOCK_WORK_ORDERS.WO_A;
      const {
        createdByUserID: WO_B_createdByUserID,
        assignedToUserID: WO_B_assignedToUserID,
        ...WO_B_fields
      } = MOCK_WORK_ORDERS.WO_B;
      const {
        createdByUserID: INV_A_createdByUserID,
        assignedToUserID: INV_A_assignedToUserID,
        workOrderID: _INV_A_workOrderID, // null
        ...INV_A_fields
      } = MOCK_INVOICES.INV_A;
      const {
        createdByUserID: INV_B_createdByUserID,
        assignedToUserID: INV_B_assignedToUserID,
        workOrderID: _INV_B_workOrderID, // null
        ...INV_B_fields
      } = MOCK_INVOICES.INV_B;

      // Assert the pre-fetched userItems
      expect(responseBody.userItems).toStrictEqual({
        myWorkOrders: {
          createdByUser: [
            {
              ...WO_A_fields,
              __typename: "WorkOrder",
              createdBy: { id: WO_A_createdByUserID },
              assignedTo: null,
              location: { ...WO_A_fields.location }, // rm Location class prototype
              createdAt: WO_A_fields.createdAt.toISOString(),
              updatedAt: WO_A_fields.updatedAt.toISOString(),
            },
          ],
          assignedToUser: [
            {
              ...WO_B_fields,
              __typename: "WorkOrder",
              createdBy: { id: WO_B_createdByUserID },
              assignedTo: { id: WO_B_assignedToUserID },
              location: { ...WO_B_fields.location }, // rm Location class prototype
              dueDate: WO_B_fields.dueDate.toISOString(),
              scheduledDateTime: WO_B_fields.scheduledDateTime.toISOString(),
              createdAt: WO_B_fields.createdAt.toISOString(),
              updatedAt: WO_B_fields.updatedAt.toISOString(),
            },
          ],
        },
        myInvoices: {
          createdByUser: [
            {
              ...INV_A_fields,
              __typename: "Invoice",
              createdBy: { id: INV_A_createdByUserID },
              assignedTo: { id: INV_A_assignedToUserID },
              workOrder: null,
              createdAt: INV_A_fields.createdAt.toISOString(),
              updatedAt: INV_A_fields.updatedAt.toISOString(),
            },
          ],
          assignedToUser: [
            {
              ...INV_B_fields,
              __typename: "Invoice",
              createdBy: { id: INV_B_createdByUserID },
              assignedTo: { id: INV_B_assignedToUserID },
              workOrder: null,
              createdAt: INV_B_fields.createdAt.toISOString(),
              updatedAt: INV_B_fields.updatedAt.toISOString(),
            },
          ],
        },
        myContacts: [
          {
            __typename: "Contact",
            id: MOCK_CONTACTS.CONTACT_A.id,
            handle: MOCK_CONTACTS.CONTACT_A.handle,
            email: MOCK_USERS.USER_B.email,
            phone: MOCK_USERS.USER_B.phone,
            profile: MOCK_USERS.USER_B.profile,
            createdAt: MOCK_CONTACTS.CONTACT_A.createdAt.toISOString(),
            updatedAt: MOCK_CONTACTS.CONTACT_A.updatedAt.toISOString(),
          },
        ],
      });
    });
  });

  describe("POST /api/auth/google-token", () => {
    test("returns a valid Fixit AuthToken and pre-fetched user-items in response body", async () => {
      // Arrange mock client request args to provide in req.body:
      const MOCK_GOOGLE_TOKEN_REQUEST_ARGS = {
        googleIDToken: JWT.signAndEncode({
          email: MOCK_USERS.USER_B.email,
          googleID: MOCK_USERS.USER_B.login.googleID,
          id: MOCK_USERS.USER_B.login.googleID, // for jwt `subject` field
        }),
      };

      // Stub AuthService.parseGoogleOAuth2IDToken
      vi.spyOn(AuthService, "parseGoogleOAuth2IDToken").mockResolvedValueOnce({
        email: MOCK_USERS.USER_B.email,
        googleID: MOCK_USERS.USER_B.login.googleID,
        profile: {
          givenName: MOCK_USERS.USER_B.profile.givenName,
          familyName: MOCK_USERS.USER_B.profile.familyName,
          photoUrl: MOCK_USERS.USER_B.profile.photoUrl,
        },
      });

      // Stub the User.query in the find-User-by-email logic
      vi.spyOn(User, "query").mockResolvedValueOnce([MOCK_USERS.USER_B]);
      // Stub ddbTable.ddbClient.query response in query-UserItems logic
      vi.spyOn(ddbTable.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [
          UNALIASED_MOCK_USERS.USER_B,
          UNALIASED_MOCK_USER_SCAs.SCA_B,
          UNALIASED_MOCK_USER_SUBS.SUB_B,
          UNALIASED_MOCK_CONTACTS.CONTACT_C,
          UNALIASED_MOCK_WORK_ORDERS.WO_B,
          UNALIASED_MOCK_INVOICES.INV_A,
          UNALIASED_MOCK_INVOICES.INV_B,
          UNALIASED_MOCK_INVOICES.INV_C,
        ],
      });
      // Stub usersCache.get response in queryUserItems fn
      vi.spyOn(usersCache, "get").mockReturnValueOnce(MOCK_USERS.USER_A);
      // Stub User.updateItem into a no-op in update-ExpoPushToken logic
      vi.spyOn(User, "updateItem").mockResolvedValueOnce({} as any);

      // Send the request
      const { status, body: responseBody } = await request(httpServer)
        .post("/api/auth/google-token")
        .send(MOCK_GOOGLE_TOKEN_REQUEST_ARGS);

      // Assert the response
      expect(status).toBe(200);
      assert(isString(responseBody?.token), "response.body.token is not present");
      assert(isPlainObject(responseBody?.userItems), "response.body.userItems is not present");

      // Assert the token payload
      const tokenPayload = await AuthToken.validateAndDecode(responseBody.token);

      expect(tokenPayload).toStrictEqual({
        id: expect.stringMatching(userModelHelpers.id.regex),
        handle: MOCK_USERS.USER_B.handle,
        email: MOCK_USERS.USER_B.email,
        phone: MOCK_USERS.USER_B.phone,
        profile: MOCK_USERS.USER_B.profile,
        stripeCustomerID: MOCK_USERS.USER_B.stripeCustomerID,
        stripeConnectAccount: {
          id: MOCK_USER_SCAs.SCA_B.id,
          detailsSubmitted: true,
          chargesEnabled: true,
          payoutsEnabled: true,
        },
        subscription: {
          id: MOCK_USER_SUBS.SUB_B.id,
          status: "active",
          currentPeriodEnd: expect.toBeValidDate(),
        },
        createdAt: expect.toBeValidDate(),
        updatedAt: expect.toBeValidDate(),
      });

      // Expected WO+INV userItems:
      const {
        createdByUserID: WO_B_createdByUserID,
        assignedToUserID: WO_B_assignedToUserID,
        ...WO_B_fields
      } = MOCK_WORK_ORDERS.WO_B;
      const {
        createdByUserID: INV_A_createdByUserID,
        assignedToUserID: INV_A_assignedToUserID,
        workOrderID: _INV_A_workOrderID, // null
        ...INV_A_fields
      } = MOCK_INVOICES.INV_A;
      const {
        createdByUserID: INV_B_createdByUserID,
        assignedToUserID: INV_B_assignedToUserID,
        workOrderID: _INV_B_workOrderID, // null
        ...INV_B_fields
      } = MOCK_INVOICES.INV_B;
      const {
        createdByUserID: INV_C_createdByUserID,
        assignedToUserID: INV_C_assignedToUserID,
        workOrderID: INV_C_workOrderID,
        ...INV_C_fields
      } = MOCK_INVOICES.INV_C;

      // Assert the pre-fetched userItems
      expect(responseBody.userItems).toStrictEqual({
        myWorkOrders: {
          createdByUser: [
            {
              ...WO_B_fields,
              __typename: "WorkOrder",
              createdBy: { id: WO_B_createdByUserID },
              assignedTo: { id: WO_B_assignedToUserID },
              location: { ...WO_B_fields.location }, // rm Location class prototype
              dueDate: WO_B_fields.dueDate.toISOString(),
              scheduledDateTime: WO_B_fields.scheduledDateTime.toISOString(),
              createdAt: WO_B_fields.createdAt.toISOString(),
              updatedAt: WO_B_fields.updatedAt.toISOString(),
            },
          ],
          assignedToUser: [],
        },
        myInvoices: {
          createdByUser: [
            {
              ...INV_B_fields,
              __typename: "Invoice",
              createdBy: { id: INV_B_createdByUserID },
              assignedTo: { id: INV_B_assignedToUserID },
              workOrder: null,
              createdAt: INV_B_fields.createdAt.toISOString(),
              updatedAt: INV_B_fields.updatedAt.toISOString(),
            },
          ],
          assignedToUser: [
            {
              ...INV_A_fields,
              __typename: "Invoice",
              createdBy: { id: INV_A_createdByUserID },
              assignedTo: { id: INV_A_assignedToUserID },
              workOrder: null,
              createdAt: INV_A_fields.createdAt.toISOString(),
              updatedAt: INV_A_fields.updatedAt.toISOString(),
            },
            {
              ...INV_C_fields,
              __typename: "Invoice",
              createdBy: { id: INV_C_createdByUserID },
              assignedTo: { id: INV_C_assignedToUserID },
              workOrder: { id: INV_C_workOrderID },
              createdAt: INV_C_fields.createdAt.toISOString(),
              updatedAt: INV_C_fields.updatedAt.toISOString(),
            },
          ],
        },
        myContacts: [
          {
            __typename: "Contact",
            id: MOCK_CONTACTS.CONTACT_C.id,
            handle: MOCK_CONTACTS.CONTACT_C.handle,
            email: MOCK_USERS.USER_A.email,
            phone: MOCK_USERS.USER_A.phone,
            profile: MOCK_USERS.USER_A.profile,
            createdAt: MOCK_CONTACTS.CONTACT_C.createdAt.toISOString(),
            updatedAt: MOCK_CONTACTS.CONTACT_C.updatedAt.toISOString(),
          },
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

      // Stub ddbTable.ddbClient.query response in queryUserItems function
      vi.spyOn(ddbTable.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [
          UNALIASED_MOCK_USERS.USER_A,
          UNALIASED_MOCK_USER_SCAs.SCA_A,
          UNALIASED_MOCK_USER_SUBS.SUB_A,
          UNALIASED_MOCK_CONTACTS.CONTACT_A,
          UNALIASED_MOCK_WORK_ORDERS.WO_A,
          UNALIASED_MOCK_WORK_ORDERS.WO_B,
          UNALIASED_MOCK_INVOICES.INV_A,
          UNALIASED_MOCK_INVOICES.INV_B,
        ],
      });
      // Stub usersCache.get response in queryUserItems function
      vi.spyOn(usersCache, "get").mockReturnValueOnce(MOCK_USERS.USER_B);
      // Stub User.updateItem into a no-op in update-ExpoPushToken logic
      vi.spyOn(User, "updateItem").mockResolvedValueOnce({} as any);

      // Send the request
      const { status, body: responseBody } = await request(httpServer)
        .post("/api/auth/token")
        .set("Authorization", `Bearer ${mockAuthToken.toString()}`);

      // Assert the response
      expect(status).toBe(200);
      assert(isString(responseBody?.token), "response.body.token is not present");
      assert(isPlainObject(responseBody?.userItems), "response.body.userItems is not present");

      // Assert the token payload
      const tokenPayload = await AuthToken.validateAndDecode(responseBody.token);
      expect(tokenPayload).toStrictEqual({
        id: expect.stringMatching(userModelHelpers.id.regex),
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

      // Expected WO+INV userItems:
      const {
        createdByUserID: WO_A_createdByUserID,
        assignedToUserID: _WO_A_assignedToUserID, // null
        ...WO_A_fields
      } = MOCK_WORK_ORDERS.WO_A;
      const {
        createdByUserID: WO_B_createdByUserID,
        assignedToUserID: WO_B_assignedToUserID,
        ...WO_B_fields
      } = MOCK_WORK_ORDERS.WO_B;
      const {
        createdByUserID: INV_A_createdByUserID,
        assignedToUserID: INV_A_assignedToUserID,
        workOrderID: _INV_A_workOrderID, // null
        ...INV_A_fields
      } = MOCK_INVOICES.INV_A;
      const {
        createdByUserID: INV_B_createdByUserID,
        assignedToUserID: INV_B_assignedToUserID,
        workOrderID: _INV_B_workOrderID, // null
        ...INV_B_fields
      } = MOCK_INVOICES.INV_B;

      // Assert the pre-fetched userItems
      expect(responseBody.userItems).toStrictEqual({
        myWorkOrders: {
          createdByUser: [
            {
              ...WO_A_fields,
              __typename: "WorkOrder",
              createdBy: { id: WO_A_createdByUserID },
              assignedTo: null,
              location: { ...WO_A_fields.location }, // rm Location class prototype
              createdAt: WO_A_fields.createdAt.toISOString(),
              updatedAt: WO_A_fields.updatedAt.toISOString(),
            },
          ],
          assignedToUser: [
            {
              ...WO_B_fields,
              __typename: "WorkOrder",
              createdBy: { id: WO_B_createdByUserID },
              assignedTo: { id: WO_B_assignedToUserID },
              location: { ...WO_B_fields.location }, // rm Location class prototype
              dueDate: WO_B_fields.dueDate.toISOString(),
              scheduledDateTime: WO_B_fields.scheduledDateTime.toISOString(),
              createdAt: WO_B_fields.createdAt.toISOString(),
              updatedAt: WO_B_fields.updatedAt.toISOString(),
            },
          ],
        },
        myInvoices: {
          createdByUser: [
            {
              ...INV_A_fields,
              __typename: "Invoice",
              createdBy: { id: INV_A_createdByUserID },
              assignedTo: { id: INV_A_assignedToUserID },
              workOrder: null,
              createdAt: INV_A_fields.createdAt.toISOString(),
              updatedAt: INV_A_fields.updatedAt.toISOString(),
            },
          ],
          assignedToUser: [
            {
              ...INV_B_fields,
              __typename: "Invoice",
              createdBy: { id: INV_B_createdByUserID },
              assignedTo: { id: INV_B_assignedToUserID },
              workOrder: null,
              createdAt: INV_B_fields.createdAt.toISOString(),
              updatedAt: INV_B_fields.updatedAt.toISOString(),
            },
          ],
        },
        myContacts: [
          {
            __typename: "Contact",
            id: MOCK_CONTACTS.CONTACT_A.id,
            handle: MOCK_CONTACTS.CONTACT_A.handle,
            email: MOCK_USERS.USER_B.email,
            phone: MOCK_USERS.USER_B.phone,
            profile: MOCK_USERS.USER_B.profile,
            createdAt: MOCK_CONTACTS.CONTACT_A.createdAt.toISOString(),
            updatedAt: MOCK_CONTACTS.CONTACT_A.updatedAt.toISOString(),
          },
        ],
      });
    });
  });
});
