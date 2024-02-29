import { MOCK_CONTACTS } from "./contacts.js";
import { MOCK_INVOICES } from "./invoices.js";
import { MOCK_USER_SCAs } from "./userStripeConnectAccounts.js";
import { MOCK_USER_SUBS } from "./userSubscriptions.js";
import { MOCK_USERS } from "./users.js";
import { MOCK_WORK_ORDERS } from "./workOrders.js";

/**
 * Factory fn to create mock-item finder functions for use in tests and mocks. The
 * returned fn can be used to find a mock item from within a static collection of
 * mock objects using the given `findFn` arg. If no mock item is found, an error is
 * thrown using `errMsg`.
 */
const getFindMockItemFn = <MocksCollection extends Record<string, Record<string, unknown>>>(
  mocks: MocksCollection
) => {
  const arrayOfMockItems = Object.values(mocks) as Array<MocksCollection[keyof MocksCollection]>;
  return (
    /** The `Array.find` function to use to find the desired mock item. */
    findFn: (mockItem: MocksCollection[keyof MocksCollection]) => boolean,
    /** The error message to use if no mock item is found. */
    errMsg: string
  ) => {
    const mockItem = arrayOfMockItems.find(findFn);
    if (!mockItem) throw new Error(errMsg);
    return mockItem;
  };
};

/**
 * Strongly-typed functions to find a mock item using a given find-fn.
 */
export const findMock = {
  /** Finds a mock Contact from within the `MOCK_CONTACTS` object. */
  contact: getFindMockItemFn(MOCK_CONTACTS),
  /** Finds a mock Invoice from within the `MOCK_INVOICES` object. */
  invoice: getFindMockItemFn(MOCK_INVOICES),
  /** Finds a mock UserStripeConnectAccount from within the `MOCK_USER_SCAs` object. */
  stripeConnectAccount: getFindMockItemFn(MOCK_USER_SCAs),
  /** Finds a mock UserSubscription from within the `MOCK_USER_SUBS` object. */
  subscription: getFindMockItemFn(MOCK_USER_SUBS),
  /** Finds a mock User from within the `MOCK_USERS` object. */
  user: getFindMockItemFn(MOCK_USERS),
  /** Finds a mock WorkOrder from within the `MOCK_WORK_ORDERS` object. */
  workOrder: getFindMockItemFn(MOCK_WORK_ORDERS),
} as const;
