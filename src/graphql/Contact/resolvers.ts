import { DeleteMutationResponse } from "@graphql/_common";
import { Contact, CONTACT_SK_REGEX } from "@models/Contact";
import { User } from "@models/User";
import { GqlUserInputError } from "@utils/customErrors";
import type { Resolvers } from "@types";

export const resolvers: Partial<Resolvers> = {
  Query: {
    contact: async (parent, { contactID }, { user }) => {
      return (await Contact.getItem({
        userID: user.id,
        contactUserID: contactID,
      } as any)) as any; // FIXME
    },
    myContacts: async (parent, args, { user }) => {
      return await Contact.queryUsersContacts(user.id);
    },
  },
  Mutation: {
    createContact: async (parent, { contactUserID }, { user }) => {
      // First, ensure the user hasn't somehow sent their own email
      if (contactUserID.toUpperCase() === user.id.toUpperCase())
        throw new GqlUserInputError("Can not add yourself as a contact");

      const requestedUser = await User.getUserByID(contactUserID);

      if (!requestedUser) throw new GqlUserInputError("Could not find requested user.");

      // create method won't overwrite existing, if Contact already exists.
      const newContact = await Contact.createOne({
        userID: user.id,
        contactUserID: requestedUser.id,
      });

      // prettier-ignore
      console.debug(
        `[Mutation.createContact] \n`,
        `\t user.id       = ${user.id} (requesting user) \n`,
        `\t contactUserID = ${contactUserID} \n`,
        `\t newContact = `, newContact, `\n`,
        `\t requestedUser = `, requestedUser, `\n`,
      );

      return {
        ...newContact,
        email: requestedUser.email,
        phone: requestedUser.phone,
        profile: requestedUser.profile,
      };
    },
    deleteContact: async (parent, { contactID }, { user }) => {
      // Test to ensure `contactID` is a valid contact ID
      if (!CONTACT_SK_REGEX.test(contactID)) throw new GqlUserInputError("Invalid contact ID");

      await Contact.deleteItem({
        userID: user.id,
        contactUserID: contactID,
      } as any); // FIXME

      return new DeleteMutationResponse({ id: contactID, wasDeleted: true });
    },
  },
};
