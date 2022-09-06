import { User } from "@models/User";
import { getEscapedRegExp, normalizeInput } from "@utils";

export const resolvers = {
  Query: {
    searchUsers: async (parent, { rawPhoneContacts }, { user }) => {
      if (!rawPhoneContacts || rawPhoneContacts.length === 0) return null;
      let searchPhones = [];
      let searchEmails = [];
      const cleanedInput = rawPhoneContacts.reduce((acc, current) => {
        const cleanedFields = {
          ...current,
          ...(!!current.phone && {
            phone: normalizeInput.phone(current.phone)
          }),
          ...(!!current.email && {
            emailRegExp: getEscapedRegExp(current.email, "i")
          })
        };

        // If either phone OR email matches user ctx, return acc (exclude from search & return objects)
        if (cleanedFields?.phone !== user.phone && !cleanedFields?.emailRegExp?.test(user.email)) {
          // Append phone, if truthy
          searchPhones = [...searchPhones, ...(cleanedFields.phone ? [cleanedFields.phone] : [])];
          // Append email, if truthy
          searchEmails = [...searchEmails, ...(cleanedFields.email ? [cleanedFields.email] : [])];
          acc.push(cleanedFields);
        }

        return acc;
      }, []);

      // const results = await User.query({  }) // FIXME might need a GSI for lookups on many emails/phones

      const results = await prisma.user.findMany({
        where: {
          type: user.otherUserType,
          OR: [{ phone: { in: searchPhones } }, { email: { in: searchEmails } }],
          [`${user.type.toLowerCase()}Contacts`]: {
            none: {
              [`${user.type.toLowerCase()}ID`]: user.id
            }
          }
        },
        select: prisma.SELECT.USER.PUBLIC_USER_FIELDS
      });

      return cleanedInput.reduce((acc, current) => {
        let existingUser = null;

        const existingUserIndex = results.findIndex(
          (matchedUser) =>
            matchedUser.phone === current.phone || current?.emailRegExp?.test(matchedUser.email)
        );

        if (existingUserIndex !== -1) {
          existingUser = results[existingUserIndex];
          results.splice(existingUserIndex, 1);
        }

        // Put existing users at the front of the list
        if (existingUser) {
          acc.unshift({
            isUser: !!existingUser,
            ...current,
            ...(existingUser && {
              id: existingUser.id,
              phone: existingUser.phone,
              email: existingUser.email,
              ...existingUser.profile
            })
          });
        } else if (current.phone) {
          acc.push({
            isUser: !!existingUser,
            ...current,
            ...(existingUser && {
              id: existingUser.id,
              phone: existingUser.phone,
              email: existingUser.email,
              ...existingUser.profile
            })
          });
        }
        return acc;
      }, []);
    }
  }
};
