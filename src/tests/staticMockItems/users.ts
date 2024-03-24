import { userModelHelpers } from "@/models/User/helpers.js";
import { normalize } from "@/utils/normalize.js";
import { MOCK_DATES, MOCK_DATE_v1_UUIDs as UUIDs } from "./dates.js";
import type { UserItem, UnaliasedUserItem } from "@/models/User";

export const MOCK_USERS = {
  /** Mock User with LOCAL login type. */
  USER_A: {
    id: userModelHelpers.id.format(UUIDs.JAN_1_2020),
    sk: userModelHelpers.sk.format(userModelHelpers.id.format(UUIDs.JAN_1_2020)),
    handle: "@user_A",
    email: "userA@gmail.com",
    phone: "(888) 111-1111",
    stripeCustomerID: "cus_AAAAAAAAAAAAAAAAAAAAAAAA",
    expoPushToken: "ExponentPushToken[AAAAAAAAAAAAAAAAAAAAAA]",
    login: {
      type: "LOCAL",
      passwordHash: "$2y$10$u6syKqiIHwZ8QZqyr1/rb.SIBMlQmVdHC7QKpLIPF.XY4bDCSYtbq",
    },
    profile: {
      displayName: "Mock McHumanPerson",
      givenName: "Mock",
      familyName: "McHumanPerson",
      businessName: "Definitely Not a Penguin in a Human Costume, LLC",
      photoUrl: "s3://mock-bucket-name/path/to/human/photo.jpg",
    },
    createdAt: MOCK_DATES.JAN_1_2020,
    updatedAt: MOCK_DATES.JAN_1_2020,
  },
  /** Mock User with GOOGLE_OAUTH login type. */
  USER_B: {
    id: userModelHelpers.id.format(UUIDs.JAN_2_2020),
    sk: userModelHelpers.sk.format(userModelHelpers.id.format(UUIDs.JAN_2_2020)),
    handle: "@user_B",
    email: "user_B@gmail.com",
    phone: "(888) 222-2222",
    stripeCustomerID: "cus_BBBBBBBBBBBBBBBBBBBBBBBB",
    expoPushToken: "ExponentPushToken[BBBBBBBBBBBBBBBBBBBBBB]",
    login: {
      type: "GOOGLE_OAUTH",
      googleID: "userB_googleID",
    },
    profile: {
      displayName: "Rick Sanchez",
      givenName: "Rick",
      familyName: "Sanchez",
      businessName: "Science Inc.",
      photoUrl: "s3://mock-bucket-name/path/to/ricks/photo.jpg",
    },
    createdAt: MOCK_DATES.JAN_2_2020,
    updatedAt: MOCK_DATES.JAN_2_2020,
  },
  /** Mock User with LOCAL login type. */
  USER_C: {
    id: userModelHelpers.id.format(UUIDs.JAN_3_2020),
    sk: userModelHelpers.sk.format(userModelHelpers.id.format(UUIDs.JAN_3_2020)),
    handle: "@user_C",
    email: "user_C@gmail.com",
    phone: "(888) 333-3333",
    stripeCustomerID: "cus_CCCCCCCCCCCCCCCCCCCCCCCC",
    expoPushToken: null,
    login: {
      type: "LOCAL",
      passwordHash: "$2y$10$HPR7h/F0QV1Bg0MkdagNhOpd2683SEOSReZlsLFZgIPPjHcRELNeO",
    },
    profile: {
      displayName: "@user_C",
      givenName: null,
      familyName: null,
      businessName: null,
      photoUrl: null,
    },
    createdAt: MOCK_DATES.JAN_3_2020,
    updatedAt: MOCK_DATES.JAN_3_2020,
  },
} as const satisfies Record<string, UserItem>;

/** Unaliased mock Users for mocking `@aws-sdk/lib-dynamodb` responses. */
export const UNALIASED_MOCK_USERS = Object.fromEntries(
  Object.entries(MOCK_USERS).map(([key, { id, email, phone, ...user }]) => [
    key,
    {
      pk: id,
      data: email,
      phone: normalize.phone(phone),
      ...user,
    },
  ])
) as { [Key in keyof typeof MOCK_USERS]: UnaliasedUserItem };
