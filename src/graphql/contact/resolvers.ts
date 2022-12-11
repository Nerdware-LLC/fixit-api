import { Contact, User } from "@models";
import { GqlUserInputError } from "@utils/customErrors";
import type { Resolvers } from "@/types/graphql";

export const resolvers: Partial<Resolvers> = {
  Query: {
    contact: async (parent, { contactID }, { user }) => {
      return (await Contact.getItem({
        userID: user.id,
        contactUserID: contactID
      } as any)) as any; // FIXME
    },
    myContacts: async (parent, args, { user }) => {
      return await Contact.queryUsersContacts(user.id);
    }
  },
  Mutation: {
    createContact: async (parent, { contactEmail }, { user }) => {
      // First, ensure the user hasn't somehow sent their own email
      if (user.email.toUpperCase() === contactEmail.toUpperCase())
        throw new GqlUserInputError("Can not add yourself as a contact");

      const requestedUser = await User.queryUserByEmail(contactEmail);

      if (!requestedUser) throw new GqlUserInputError("Could not find requested user.");

      // create method won't overwrite existing, if Contact already exists.
      const newContact = await Contact.createOne({
        userID: user.id,
        contactUserID: requestedUser.id
      });

      return {
        ...newContact,
        email: contactEmail
      };
    },
    deleteContact: async (parent, { contactEmail }, { user }) => {
      // First, ensure the user hasn't somehow sent their own email
      if (user.email.toUpperCase() === contactEmail.toUpperCase())
        throw new GqlUserInputError("Invalid contact email.");

      const requestedUser = await User.queryUserByEmail(contactEmail);

      if (!requestedUser) throw new GqlUserInputError("Could not find requested user.");

      // create method won't overwrite existing, if Contact already exists.
      await Contact.deleteItem({
        userID: user.id,
        contactUserID: requestedUser.id
      } as any); // FIXME

      return { id: `CONTACT#${requestedUser.id}` } as any; // FIXME;
    }
  }
};
