import { DeleteMutationResponse } from "@/graphql/_common";
import { usersCache } from "@/lib/cache";
import { Contact, type ContactItem } from "@/models/Contact";
import { User } from "@/models/User";
import { GqlUserInputError } from "@/utils/httpErrors";
import type { Resolvers, Contact as GqlContact } from "@/types";

export const resolvers: Partial<Resolvers> = {
  Query: {
    contact: async (_parent, { contactID }, { user }) => {
      const existingContact = await Contact.getItem({ userID: user.id, id: contactID });
      return formatAsGqlContact(existingContact);
    },
    myContacts: async (_parent, _args, { user }) => {
      const contacts = await Contact.query({
        where: {
          userID: user.id,
          id: { beginsWith: Contact.SK_PREFIX },
        },
      });

      return contacts.map((contact) => formatAsGqlContact(contact));
    },
  },
  Mutation: {
    createContact: async (_parent, { contactUserID }, { user }) => {
      // First, ensure the user hasn't somehow sent their own ID
      if (`${contactUserID}`.toUpperCase() === user.id.toUpperCase()) {
        throw new GqlUserInputError("Can not add yourself as a contact");
      }

      const requestedUser = await User.getItem({ id: contactUserID });

      if (!requestedUser) throw new GqlUserInputError("Requested user not found.");

      // create method won't overwrite existing, if Contact already exists.
      const newContact = await Contact.createItem({
        userID: user.id,
        contactUserID: requestedUser.id,
        handle: requestedUser.handle,
      });

      return {
        id: newContact.id,
        handle: requestedUser.handle,
        email: requestedUser.email,
        phone: requestedUser.phone,
        profile: requestedUser.profile,
        createdAt: newContact.createdAt,
        updatedAt: newContact.updatedAt,
      };
    },
    deleteContact: async (_parent, { contactID }, { user }) => {
      // Test to ensure `contactID` is a valid contact ID
      if (!Contact.isValidID(contactID)) throw new GqlUserInputError("Invalid contact ID.");

      await Contact.deleteItem({ userID: user.id, id: contactID });

      return new DeleteMutationResponse({ id: contactID, wasDeleted: true });
    },
  },
};

/**
 * Converts an `ContactItem` to a `GqlContact`. If the `ContactItem`
 * is not found in the `usersCache`, a `GqlUserInputError` is thrown.
 */
const formatAsGqlContact = (
  contact?: Partial<ContactItem>,
  invalidContactErrMsg: string = "Contact not found."
): GqlContact => {
  if (
    !contact?.id ||
    !contact?.createdAt ||
    !contact?.updatedAt ||
    !contact?.handle ||
    !usersCache.has(contact.handle)
  ) {
    throw new GqlUserInputError(invalidContactErrMsg);
  }

  const { email, phone, profile } = usersCache.get(contact.handle) as GqlContact;

  return {
    id: contact.id,
    handle: contact.handle,
    email,
    phone,
    profile,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
};
