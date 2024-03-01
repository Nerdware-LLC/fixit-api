import { DeleteMutationResponse } from "@/graphql/_common";
import { usersCache } from "@/lib/cache/usersCache.js";
import { Contact } from "@/models/Contact/Contact.js";
import { User } from "@/models/User/User.js";
import { GqlUserInputError, GqlInternalServerError } from "@/utils/httpErrors.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Partial<Resolvers> = {
  Query: {
    contact: async (_parent, { contactID }, { user }) => {
      const contact = await Contact.getItem({ userID: user.id, id: contactID });

      if (!contact) {
        throw new GqlUserInputError("A contact with the provided ID could not be found.");
      }

      return contact;
    },
    myContacts: async (_parent, _args, { user }) => {
      return await Contact.query({
        where: {
          userID: user.id,
          id: { beginsWith: Contact.SK_PREFIX },
        },
      });
    },
  },
  Mutation: {
    createContact: async (_parent, { contactUserID }, { user }) => {
      // First, ensure the user hasn't somehow sent their own ID
      if (contactUserID.toUpperCase() === user.id.toUpperCase()) {
        throw new GqlUserInputError("Can not add yourself as a contact");
      }

      const requestedUser = await User.getItem({ id: contactUserID });

      if (!requestedUser) throw new GqlUserInputError("Requested user not found.");

      // create method won't overwrite existing, if Contact already exists.
      return await Contact.createItem({
        userID: user.id,
        contactUserID: requestedUser.id,
        handle: requestedUser.handle,
      });
    },
    deleteContact: async (_parent, { contactID }, { user }) => {
      // Test to ensure `contactID` is a valid contact ID
      if (!Contact.isValidID(contactID)) throw new GqlUserInputError("Invalid contact ID.");

      await Contact.deleteItem({ userID: user.id, id: contactID });

      return new DeleteMutationResponse({ id: contactID, wasDeleted: true });
    },
  },
  Contact: {
    email: async (parent) => {
      let user = usersCache.get(parent.handle);

      user ||= await User.getItem({ id: parent.contactUserID });

      if (!user?.email) {
        throw new GqlInternalServerError("Contact email could not be found.");
      }

      return user.email;
    },
    phone: async (parent) => {
      let user = usersCache.get(parent.handle);

      user ||= await User.getItem({ id: parent.contactUserID });

      if (!user?.phone) {
        throw new GqlInternalServerError("Contact phone could not be found.");
      }

      return user.phone;
    },
    profile: async (parent) => {
      let user = usersCache.get(parent.handle);

      user ||= await User.getItem({ id: parent.contactUserID });

      if (!user?.profile) {
        throw new GqlInternalServerError("Contact profile could not be found.");
      }

      return user.profile;
    },
  },
};
