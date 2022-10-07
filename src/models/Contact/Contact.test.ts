import moment from "moment";
import { Contact } from "./Contact";
import { CONTACT_SK_REGEX } from "./regex";
import type { ContactType } from "./types";

const USER_1 = "USER#11111111-1111-1111-1111-contact11111";
const USER_2 = "USER#22222222-2222-2222-2222-contact22222";
const USER_3 = "USER#33333333-3333-3333-3333-contact33333";

const MOCK_INPUTS = {
  // CONTACT_A contains the bare minimum inputs for Contact.createItem
  CONTACT_A: {
    userID: USER_1,
    contactUserID: USER_2
  },
  // CONTACT_B contains all Contact properties that can be provided to Contact.createItem
  CONTACT_B: {
    userID: USER_2,
    contactUserID: USER_3
  }
} as const;

// This array of string literals from MOCK_INPUTS keys provides better TS inference in the tests below.
const MOCK_INPUT_KEYS = Object.keys(MOCK_INPUTS) as Array<keyof typeof MOCK_INPUTS>;

const testContactFields = (mockInputsKey: keyof typeof MOCK_INPUTS, mockContact: ContactType) => {
  const mockContactInputs = MOCK_INPUTS[mockInputsKey];

  expect(mockContact.userID).toEqual(mockContactInputs.userID);
  expect(mockContact.sk).toMatch(CONTACT_SK_REGEX);
  expect(mockContact.contactUserID).toEqual(mockContactInputs.contactUserID);

  expect(moment(mockContact.createdAt).isValid()).toEqual(true);
  expect(moment(mockContact.updatedAt).isValid()).toEqual(true);
};

describe("Contact model R/W database operations", () => {
  let createdContacts = {} as {
    -readonly [K in keyof typeof MOCK_INPUTS]: Expand<
      ContactType & Required<Pick<ContactType, "sk" | "contactUserID">>
    >;
  };

  // Write mock Contacts to Table
  beforeAll(async () => {
    for (const key of MOCK_INPUT_KEYS) {
      createdContacts[key] = await Contact.createOne(MOCK_INPUTS[key]);
    }
  });

  // CREATE:

  test("Contact.createOne returns expected keys and values", () => {
    Object.entries(createdContacts).forEach(([mockInputsKey, createdContact]) => {
      testContactFields(mockInputsKey as keyof typeof MOCK_INPUTS, createdContact);
    });
  });

  // QUERIES:

  test("Contact.queryContactByID returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const { userID, contactUserID } = createdContacts[key];
      const result = await Contact.queryContactByID(userID, contactUserID);
      testContactFields(key, result);
    }
  });

  test("Contact.queryUsersContacts returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      // Should be an array of 1 Contact
      const contacts = await Contact.queryUsersContacts(createdContacts[key].userID);

      contacts.forEach((contact) => {
        testContactFields(key, contact);
      });
    }
  });

  // DELETE:

  test("Contact.deleteItem returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const { userID, sk } = createdContacts[key];
      // If deleteOne did not error out, the delete succeeded - test returned ID.
      const { userID: userIDofDeletedContactItem } = await Contact.deleteItem({ userID, sk });
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
    ExpressionAttributeValues: { ":skPrefix": "CONTACT#" }
  });

  if (Array.isArray(remainingMockContacts) && remainingMockContacts.length > 0) {
    await Contact.ddbClient.batchDeleteItems(
      remainingMockContacts.map(({ pk, sk }) => ({ pk, sk }))
    );
  }
});
