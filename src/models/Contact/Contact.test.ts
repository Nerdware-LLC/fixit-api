import { MOCK_CONTACTS, UNALIASED_MOCK_CONTACTS } from "@/tests/staticMockItems/contacts.js";
import { Contact } from "./Contact.js";

// Arrange mock Contacts
const { CONTACT_A, CONTACT_B, CONTACT_C } = MOCK_CONTACTS;

describe("Contact Model", () => {
  describe("Contact.createItem()", () => {
    test("returns a valid Contact when called with valid arguments", async () => {
      // Arrange mock Contacts
      for (const key in MOCK_CONTACTS) {
        // Get createItem inputs from mock Contact
        const mockContact = MOCK_CONTACTS[key as keyof typeof MOCK_CONTACTS];
        const { userID, handle, contactUserID } = mockContact;

        // Act on the Contact Model's createItem method
        const result = await Contact.createItem({ userID, handle, contactUserID });

        // Assert the result
        expect(result).toStrictEqual({
          ...mockContact,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      }
    });
    test(`throws an Error when called without a valid "userID"`, async () => {
      await expect(() =>
        Contact.createItem({
          // missing userID
          handle: CONTACT_A.handle,
          contactUserID: CONTACT_A.contactUserID,
        } as any)
      ).rejects.toThrow(/A value is required for Contact property "userID"/);
      await expect(() =>
        Contact.createItem({
          userID: CONTACT_A.id, // <-- invalid userID (should not be a Contact ID)
          handle: CONTACT_A.handle,
          contactUserID: CONTACT_A.contactUserID,
        } as any)
      ).rejects.toThrow(/invalid value/i);
    });
    test(`throws an Error when called without a valid "handle"`, async () => {
      await expect(() =>
        Contact.createItem({
          userID: CONTACT_A.userID,
          // missing handle
          contactUserID: CONTACT_A.contactUserID,
        } as any)
      ).rejects.toThrow(/A value is required for Contact property "handle"/);
      await expect(() =>
        Contact.createItem({
          userID: CONTACT_A.userID,
          handle: "BAD_HANDLE", // <-- invalid handle
          contactUserID: CONTACT_A.contactUserID,
        } as any)
      ).rejects.toThrow(/invalid value/i);
    });
    test(`throws an Error when called without a valid "contactUserID"`, async () => {
      await expect(() =>
        Contact.createItem({
          userID: CONTACT_A.userID,
          handle: CONTACT_A.handle,
          // missing contactUserID
        } as any)
      ).rejects.toThrow(/A value is required for Contact property "id"/);
      await expect(() =>
        Contact.createItem({
          userID: CONTACT_A.userID,
          handle: CONTACT_A.handle,
          contactUserID: CONTACT_A.id, // <-- invalid contactUserID (should not be a Contact ID)
        } as any)
      ).rejects.toThrow(/invalid value/i);
    });
  });

  describe("Contact.query()", () => {
    test(`returns desired Contact when queried by "id"`, async () => {
      // Arrange spy on Contact.ddbClient.query() method
      const querySpy = vi.spyOn(Contact.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [UNALIASED_MOCK_CONTACTS.CONTACT_A],
      });

      // Act on the Contact Model's query method
      const result = await Contact.query({
        where: { id: CONTACT_A.id },
        limit: 1,
      });

      // Assert the result
      expect(result).toHaveLength(1);
      expect(result).toStrictEqual([CONTACT_A]);

      // Assert querySpy was called with expected arguments
      expect(querySpy).toHaveBeenCalledWith({
        TableName: Contact.tableName,
        IndexName: "Overloaded_SK_GSI",
        KeyConditionExpression: "#sk = :sk",
        ExpressionAttributeNames: { "#sk": "sk" },
        ExpressionAttributeValues: { ":sk": CONTACT_A.id },
        Limit: 1,
      });
    });

    test("returns all of a User's Contacts when queried by the User's ID", async () => {
      // Arrange spy on Contact.ddbClient.query() method
      const querySpy = vi.spyOn(Contact.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [UNALIASED_MOCK_CONTACTS.CONTACT_A, UNALIASED_MOCK_CONTACTS.CONTACT_B],
      });

      // Act on the Contact Model's query method
      const result = await Contact.query({
        where: {
          userID: CONTACT_A.userID,
          id: { beginsWith: Contact.SK_PREFIX },
        },
      });

      // Assert the result
      expect(result).toHaveLength(2);
      expect(result).toStrictEqual([CONTACT_A, CONTACT_B]);

      // Assert querySpy was called with expected arguments
      expect(querySpy).toHaveBeenCalledWith({
        TableName: Contact.tableName,
        KeyConditionExpression: "#pk = :pk AND begins_with( #sk, :sk )",
        ExpressionAttributeNames: { "#pk": "pk", "#sk": "sk" },
        ExpressionAttributeValues: { ":pk": CONTACT_A.userID, ":sk": Contact.SK_PREFIX },
      });
    });
  });

  describe("Contact.updateItem()", () => {
    test("returns an updated Contact with expected keys and values", async () => {
      // Arrange value to update
      const NEW_HANDLE = "@updated_contactC_handle";

      // Arrange spy on Contact.ddbClient.updateItem() method
      const updateItemSpy = vi.spyOn(Contact.ddbClient, "updateItem").mockResolvedValueOnce({
        $metadata: {},
        Attributes: { ...UNALIASED_MOCK_CONTACTS.CONTACT_C, handle: NEW_HANDLE },
      });

      // Act on the Contact Model's updateItem method
      const result = await Contact.updateItem(
        { id: CONTACT_C.id, userID: CONTACT_C.userID },
        {
          update: {
            handle: NEW_HANDLE,
          },
        }
      );

      // Assert the result
      expect(result).toStrictEqual({ ...CONTACT_C, handle: NEW_HANDLE });

      // Assert updateItemSpy was called with expected arguments
      expect(updateItemSpy).toHaveBeenCalledWith({
        TableName: Contact.tableName,
        Key: { pk: CONTACT_C.userID, sk: CONTACT_C.id },
        UpdateExpression: "SET #handle = :handle, #updatedAt = :updatedAt",
        ExpressionAttributeNames: { "#handle": "handle", "#updatedAt": "updatedAt" },
        ExpressionAttributeValues: { ":handle": NEW_HANDLE, ":updatedAt": expect.any(Number) },
        ReturnValues: "ALL_NEW",
      });
    });
  });

  describe("Contact.deleteItem()", () => {
    test("returns a deleted Contact", async () => {
      // Arrange spy on Contact.ddbClient.deleteItem() method
      const deleteItemSpy = vi.spyOn(Contact.ddbClient, "deleteItem").mockResolvedValueOnce({
        $metadata: {},
        Attributes: UNALIASED_MOCK_CONTACTS.CONTACT_C,
      });

      // Act on the Contact Model's deleteItem method
      const result = await Contact.deleteItem({ id: CONTACT_C.id, userID: CONTACT_C.userID });

      // Assert the result
      expect(result).toStrictEqual(CONTACT_C);

      // Assert deleteItemSpy was called with expected arguments
      expect(deleteItemSpy).toHaveBeenCalledWith({
        TableName: Contact.tableName,
        Key: { pk: CONTACT_C.userID, sk: CONTACT_C.id },
        ReturnValues: "ALL_OLD",
      });
    });
  });
});
