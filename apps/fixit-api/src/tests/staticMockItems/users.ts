import { sanitizePhone } from "@nerdware/ts-string-helpers";
import { userModelHelpers } from "@/models/User/helpers.js";
import { MOCK_DATES } from "./dates.js";
import type { UserItem, UnaliasedUserItem } from "@/models/User";

const MOCK_USER_HANDLES = { USER_A: "@user_A", USER_B: "@user_B", USER_C: "@user_C" } as const;

const MOCK_USER_IDS = {
  USER_A: userModelHelpers.id.format(MOCK_USER_HANDLES.USER_A),
  USER_B: userModelHelpers.id.format(MOCK_USER_HANDLES.USER_B),
  USER_C: userModelHelpers.id.format(MOCK_USER_HANDLES.USER_C),
} as const;

export const MOCK_USERS = {
  /** Mock User with LOCAL login type. */
  USER_A: {
    id: MOCK_USER_IDS.USER_A,
    sk: userModelHelpers.sk.format(MOCK_USER_IDS.USER_A),
    handle: MOCK_USER_HANDLES.USER_A,
    email: "user_a@gmail.com",
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
    id: MOCK_USER_IDS.USER_B,
    sk: userModelHelpers.sk.format(MOCK_USER_IDS.USER_B),
    handle: MOCK_USER_HANDLES.USER_B,
    email: "user_b@gmail.com",
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
    id: MOCK_USER_IDS.USER_C,
    sk: userModelHelpers.sk.format(MOCK_USER_IDS.USER_C),
    handle: MOCK_USER_HANDLES.USER_C,
    email: "user_c@gmail.com",
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
      phone: sanitizePhone(phone),
      ...user,
    },
  ])
) as { [Key in keyof typeof MOCK_USERS]: UnaliasedUserItem };
