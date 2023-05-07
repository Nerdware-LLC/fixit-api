import { ddbSingleTable } from "@lib/dynamoDB";
import { ENV } from "@server";
import { getEscapedRegExp, normalizeInput, GqlUserInputError } from "@utils";
import type { Resolvers, PhoneContact, UserType } from "@types";

// export const resolvers: Partial<Resolvers> = {
export const resolvers: any = {
  Query: {
    searchUsersForPhoneContacts: async (parent: any, { rawPhoneContacts }: any, { user }: any) => {
      /* FIXME See below FIXME regarding this query-resolver's cache requirement. */
      if (ENV.NODE_ENV !== "development") {
        throw new GqlUserInputError("This query is not yet available");
      }

      if (!rawPhoneContacts || rawPhoneContacts.length === 0) return null;

      let searchPhones: Array<string> = [];
      let searchEmails: Array<string> = [];

      const cleanedInput = rawPhoneContacts.reduce((acc: any, current: any) => {
        const cleanedFields = {
          id: current.id,
          ...(!!current.phone && {
            phone: normalizeInput.phone(current.phone),
          }),
          ...(!!current.email && {
            emailRegExp: getEscapedRegExp(current.email, "i"),
          }),
          email: current?.email ?? "",
          profile: {
            displayName: current?.name ?? "",
            photoUrl: current?.photoUrl ?? "",
          },
        };

        // If either phone OR email matches user ctx, return acc (exclude from search & return objects)
        if (cleanedFields?.phone !== user.phone && !cleanedFields?.emailRegExp?.test(user.email)) {
          // Append phone, if truthy
          if (cleanedFields?.phone) searchPhones.push(cleanedFields.phone);
          // Append email, if truthy
          if (cleanedFields?.email) searchEmails.push(cleanedFields.email);
          acc.push(cleanedFields);
        }

        return acc;
      }, [] as Array<(typeof rawPhoneContacts)[number] & { emailRegExp?: RegExp }>);

      // FIXME Current table design necessitates a table scan to query all users, which
      // is never desirable. A cache needs to be implemented to cut down on DDB RCUs before
      // this resolver is made publicly available to end users.

      // We want the raw attributes from the DB to compare "SK" values, so we don't use a Model-instance here.
      const results = (await ddbSingleTable.ddbClient.scan({
        ProjectionExpression: "pk, sk, data, phone, profile",
        // FIXME Add FilterExpression to filter out non-User items
      })) as unknown as Array<UserType>; // FIXME phoneContacts-resolver scan return type

      return cleanedInput.reduce((acc: any, current: any) => {
        let existingUser = null;

        const existingUserIndex = results.findIndex(
          (matchedUser) =>
            matchedUser.phone === current.phone ||
            (current?.emailRegExp?.test(matchedUser?.email ?? "") ?? false)
        );

        if (existingUserIndex !== -1) {
          existingUser = results[existingUserIndex];
          results.splice(existingUserIndex, 1);
        }

        // Put existing users at the front of the list
        if (existingUser) {
          acc.unshift({
            isUser: true,
            ...current,
            ...(existingUser && {
              id: existingUser.id,
              handle: existingUser.handle,
              phone: existingUser.phone,
              email: existingUser.email,
              profile: {
                ...existingUser.profile,
              },
            }),
          });
        } else if (current.phone) {
          acc.push({
            isUser: false,
            id: current.id,
            email: current.email,
            phone: current.phone,
            profile: {
              displayName: current.name || current.email || "",
              photoUrl: current.photoUrl,
            },
          });
        }
        return acc;
      }, [] as Array<PhoneContact>) as any;
    },
  },
};
