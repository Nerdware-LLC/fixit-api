import { UserInputError } from "apollo-server-express";
import { Contact, User } from "@models";

export const resolvers = {
  Query: {
    contact: async (parent, { contactID }, { user }) => {
      return await Contact.get({
        userID: user.id,
        contactUserID: contactID
      });
    },
    myContacts: async (parent, args, { user }) => {
      return await Contact.queryUserContacts(user.id);
    }
  },
  Mutation: {
    createContact: async (parent, { contactEmail }, { user }) => {
      // First, ensure the user hasn't somehow sent their own email
      if (user.email.toUpperCase() === contactEmail.toUpperCase())
        throw new UserInputError("Can not add yourself as a contact");

      const requestedUser = await User.queryUserByEmail(contactEmail);

      if (!requestedUser) throw new UserInputError("Could not find requested user.");

      // create method won't overwrite existing, if Contact already exists.
      const newContact = await Contact.create({
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
        throw new UserInputError("Invalid contact email.");

      const requestedUser = await User.queryUserByEmail(contactEmail);

      if (!requestedUser) throw new UserInputError("Could not find requested user.");

      // create method won't overwrite existing, if Contact already exists.
      await Contact.delete({
        userID: user.id,
        contactUserID: requestedUser.id
      });

      return { id: `CONTACT#${requestedUser.id}` };
    }
  }
};
