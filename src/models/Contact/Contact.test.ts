import moment from "moment";
import { test, expect, describe, beforeAll, afterAll } from "vitest";
import { Contact } from "./Contact";
import type { ContactModelItem, ContactModelInput } from "./Contact";

const USER_1 = "USER#11111111-1111-1111-1111-contact11111";
const USER_2 = "USER#22222222-2222-2222-2222-contact22222";
const USER_3 = "USER#33333333-3333-3333-3333-contact33333";

const MOCK_INPUTS: Record<"CONTACT_A" | "CONTACT_B", Partial<ContactModelInput>> = {
  CONTACT_A: {
    userID: USER_1,
    contactUserID: USER_2,
    handle: "@contact_A",
  },
  CONTACT_B: {
    userID: USER_2,
    contactUserID: USER_3,
    handle: "@contact_B",
  },
} as const;

type MockInputKey = keyof typeof MOCK_INPUTS;
// This array of string literals from MOCK_INPUTS keys provides better TS inference in the tests below.
const MOCK_INPUT_KEYS = Object.keys(MOCK_INPUTS) as Array<MockInputKey>;

const testContactFields = (mockInputsKey: MockInputKey, mockContact: ContactModelItem) => {
  const mockContactInputs = MOCK_INPUTS[mockInputsKey];

  expect(mockContact.userID).toEqual(mockContactInputs.userID);
  expect(Contact.isValidID(mockContact.id)).toBe(true);
  expect(mockContact.contactUserID).toEqual(mockContactInputs.contactUserID);

  expect(moment(mockContact.createdAt).isValid()).toBe(true);
  expect(moment(mockContact.updatedAt).isValid()).toBe(true);
};

describe("Contact model R/W database operations", () => {
  const createdContacts = {} as { [K in MockInputKey]: ContactModelItem };

  // Write mock Contacts to Table
  beforeAll(async () => {
    for (const key of MOCK_INPUT_KEYS) {
      createdContacts[key] = await Contact.createItem(MOCK_INPUTS[key] as any);
    }
  });

  // CREATE:

  test("Contact.createItem returns expected keys and values", () => {
    Object.entries(createdContacts).forEach(([mockInputsKey, createdContact]) => {
      testContactFields(mockInputsKey as keyof typeof MOCK_INPUTS, createdContact);
    });
  });

  // QUERIES:

  test("Contact.query a Contact by ID returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const { userID, contactUserID } = createdContacts[key];
      const [result] = await Contact.query({
        where: {
          userID,
          id: Contact.getFormattedID(contactUserID),
        },
        limit: 1,
      });
      testContactFields(key, result);
    }
  });

  test("Contact.query a User's Contacts returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      // Should be an array of 1 Contact
      const contacts = await Contact.query({
        where: {
          userID: createdContacts[key].userID,
          id: { beginsWith: Contact.SK_PREFIX },
        },
      });

      contacts.forEach((contact) => {
        testContactFields(key, contact);
      });
    }
  });

  // DELETE:

  test("Contact.deleteItem returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const { userID, id } = createdContacts[key];
      // If deleteOne did not error out, the delete succeeded - test returned ID.
      const { userID: userIDofDeletedContactItem } = await Contact.deleteItem({ userID, id });
      expect(userIDofDeletedContactItem).toEqual(userID);
    }
  });
});

// ENSURE MOCK RESOURCE CLEANUP:

afterAll(async () => {
  /* After all tests are complete, ensure all mock Items created here have been deleted.
  Note: DDB methods are called from the ddbClient to circumvent toDB IO hook actions. */

  const remainingMockContacts = await Contact.ddbClient.scan({
    FilterExpression: "begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: { ":skPrefix": Contact.SK_PREFIX },
  });

  if (Array.isArray(remainingMockContacts) && remainingMockContacts.length > 0) {
    await Contact.ddbClient.batchDeleteItems(
      remainingMockContacts.map(({ pk, sk }) => ({ pk, sk }))
    );
  }
});
