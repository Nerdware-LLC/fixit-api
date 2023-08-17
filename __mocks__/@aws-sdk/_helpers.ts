import {
  UNALIASED_MOCK_USERS,
  UNALIASED_MOCK_USER_SCAs,
  UNALIASED_MOCK_USER_SUBS,
  UNALIASED_MOCK_CONTACTS,
  UNALIASED_MOCK_WORK_ORDERS,
  UNALIASED_MOCK_INVOICES,
} from "@tests/staticMockItems";
import { hasKey } from "@utils/typeSafety";

/** An array containing unaliased mock items for `lib-dynamodb` stubs to return. */
export const UNALIASED_MOCKS = [
  ...Object.values(UNALIASED_MOCK_USERS),
  ...Object.values(UNALIASED_MOCK_USER_SCAs),
  ...Object.values(UNALIASED_MOCK_USER_SUBS),
  ...Object.values(UNALIASED_MOCK_CONTACTS),
  ...Object.values(UNALIASED_MOCK_WORK_ORDERS),
  ...Object.values(UNALIASED_MOCK_INVOICES),
];

/** Finds an _**unaliased**_ mock item with matching pk/sk/data attribute values. */
export const findUnaliasedMockItem = ({ pk, sk, data }: FixitItemKeyOrIndexAttr) => {
  const attrEntries = Object.entries({ pk, sk, data }).filter(([, value]) => value !== undefined);
  return UNALIASED_MOCKS.find((mockItem) =>
    attrEntries.every(
      ([attrName, attrValue]) => hasKey(mockItem, attrName) && mockItem[attrName] === attrValue
    )
  );
};

interface FixitItemKeyOrIndexAttr {
  pk?: string;
  sk?: string;
  data?: string;
}
