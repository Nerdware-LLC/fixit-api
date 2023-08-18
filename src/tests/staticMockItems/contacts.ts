import { contactModelHelpers } from "@/models/Contact/helpers";
import { MOCK_DATES } from "./dates";
import { MOCK_USERS } from "./users";
import type { ContactModelItem, UnaliasedContactModelItem } from "@/models/Contact";
import type { MocksCollection } from "./_types";

const { USER_A, USER_B, USER_C } = MOCK_USERS;

export const MOCK_CONTACTS: MocksCollection<"Contact", ContactModelItem> = {
  /** USER_A contact-connection with USER_B */
  CONTACT_A: {
    id: contactModelHelpers.id.format(USER_B.id),
    userID: USER_A.id,
    handle: USER_A.handle,
    contactUserID: USER_B.id,
    createdAt: MOCK_DATES.JAN_1_2020,
    updatedAt: MOCK_DATES.JAN_1_2020,
  },
  /** USER_A contact-connection with USER_C */
  CONTACT_B: {
    id: contactModelHelpers.id.format(USER_C.id),
    userID: USER_A.id,
    handle: USER_A.handle,
    contactUserID: USER_C.id,
    createdAt: MOCK_DATES.JAN_2_2020,
    updatedAt: MOCK_DATES.JAN_2_2020,
  },
  /** USER_B contact-connection with USER_A */
  CONTACT_C: {
    id: contactModelHelpers.id.format(USER_A.id),
    userID: USER_B.id,
    handle: USER_B.handle,
    contactUserID: USER_A.id,
    createdAt: MOCK_DATES.JAN_3_2020,
    updatedAt: MOCK_DATES.JAN_3_2020,
  },
};

/** Unaliased mock Contacts for mocking `@aws-sdk/lib-dynamodb` responses. */
export const UNALIASED_MOCK_CONTACTS = Object.fromEntries(
  Object.entries(MOCK_CONTACTS).map(([key, { userID, id, contactUserID, ...contact }]) => [
    key,
    {
      pk: userID,
      sk: id,
      data: contactUserID,
      ...contact,
    },
  ])
) as MocksCollection<"Contact", UnaliasedContactModelItem>;
