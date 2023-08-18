import { MOCK_CONTACTS } from "@tests/staticMockItems";
import { Contact } from "./Contact";

/**
 * NOTE: The following packages are mocked before these tests are run:
 * - `@aws-sdk/lib-dynamodb`
 * - `stripe`
 *
 * See Vitest setup file `src/__tests__/setupTests.ts`
 */

const { CONTACT_A, CONTACT_B, CONTACT_C } = MOCK_CONTACTS;

describe("Contact Model", () => {
  describe("Contact.createItem()", () => {
    test("returns a valid Contact when called with valid args", async () => {
      const result = await Contact.createItem({
        userID: CONTACT_A.userID,
        handle: CONTACT_A.handle,
        contactUserID: CONTACT_A.contactUserID,
      });
      expect(result).toEqual({
        ...CONTACT_A,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("Contact.query()", () => {
    test("returns desired Contact when queried by ID", async () => {
      const [result] = await Contact.query({
        where: {
          userID: CONTACT_A.userID,
          id: Contact.getFormattedID(CONTACT_A.contactUserID),
        },
        limit: 1,
      });
      expect(result).toEqual({
        ...CONTACT_A,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    test("returns all of a User's Contacts when queried by the User's ID", async () => {
      const result = await Contact.query({
        where: {
          userID: CONTACT_A.userID,
          id: { beginsWith: Contact.SK_PREFIX },
        },
      });
      // result should contain User IDs for mock User A's Contacts
      expect(result).toHaveLength(2);
      expect(result).toEqual([CONTACT_A, CONTACT_B]);
    });
  });

  describe("Contact.updateItem()", () => {
    test("returns an updated Contact with expected keys and values", async () => {
      const NEW_HANDLE = "@updated_contactC_handle";
      const result = await Contact.updateItem(CONTACT_C, { handle: NEW_HANDLE });
      expect(result.id).toBe(CONTACT_C.id);
      expect(result.handle).toBe(NEW_HANDLE);
    });
  });

  describe("Contact.deleteItem()", () => {
    test("returns a deleted Contact's ID", async () => {
      for (const key in MOCK_CONTACTS) {
        const { userID, id } = MOCK_CONTACTS[key];
        const result = await Contact.deleteItem({ userID, id });
        expect(result?.id).toBe(id);
      }
    });
  });
});
