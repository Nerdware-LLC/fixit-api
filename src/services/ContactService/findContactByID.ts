import { Contact } from "@/models/Contact";
import { UserInputError } from "@/utils/httpErrors.js";

/**
 * ### ContactService: findContactByID
 */
export const findContactByID = async ({
  authenticatedUserID,
  contactID,
}: {
  authenticatedUserID: string;
  contactID: string;
}) => {
  const contact = await Contact.getItem({
    userID: authenticatedUserID,
    id: contactID,
  });

  if (!contact) throw new UserInputError("A contact with the provided ID could not be found.");

  return contact;
};
