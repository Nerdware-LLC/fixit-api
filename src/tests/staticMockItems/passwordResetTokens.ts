import dayjs from "dayjs";
import { passwordResetTokenModelHelpers } from "@/models/PasswordResetToken/helpers.js";
import { MOCK_DATES } from "./dates.js";
import { MOCK_USERS } from "./users.js";
import type {
  PasswordResetTokenItem,
  UnaliasedPasswordResetTokenItem,
} from "@/models/PasswordResetToken";

const { USER_A, USER_B, USER_C } = MOCK_USERS;

const TOKEN_STR_A = "a".repeat(96);
const TOKEN_STR_B = "b".repeat(96);
const TOKEN_STR_C = "c".repeat(96);

export const MOCK_PW_RESET_TOKENS = {
  /**  */
  TOKEN_A: {
    token: TOKEN_STR_A,
    sk: passwordResetTokenModelHelpers.sk.format(TOKEN_STR_A),
    data: passwordResetTokenModelHelpers.data.format(TOKEN_STR_A),
    userID: USER_A.id,
    expiresAt: dayjs(MOCK_DATES.JAN_1_2020).add(10, "minutes").unix(), // not expired
  },
  /**  */
  TOKEN_B: {
    token: TOKEN_STR_B,
    sk: passwordResetTokenModelHelpers.sk.format(TOKEN_STR_B),
    data: passwordResetTokenModelHelpers.data.format(TOKEN_STR_B),
    userID: USER_B.id,
    expiresAt: dayjs(MOCK_DATES.JAN_2_2020).add(10, "minutes").unix(), // not expired
  },
  /**  */
  TOKEN_C: {
    token: TOKEN_STR_C,
    sk: passwordResetTokenModelHelpers.sk.format(TOKEN_STR_C),
    data: passwordResetTokenModelHelpers.data.format(TOKEN_STR_C),
    userID: USER_C.id,
    expiresAt: dayjs(MOCK_DATES.JAN_3_2020).add(20, "minutes").unix(), // expired (TTL = 15 minutes)
  },
} as const satisfies Record<string, PasswordResetTokenItem>;

/** Unaliased mock PasswordResetTokens for mocking `@aws-sdk/lib-dynamodb` responses. */
export const UNALIASED_PW_RESET_TOKENS = Object.fromEntries(
  Object.entries(MOCK_PW_RESET_TOKENS).map(([key, { token, ...rest }]) => [
    key,
    { pk: token, ...rest },
  ])
) as { [Key in keyof typeof MOCK_PW_RESET_TOKENS]: UnaliasedPasswordResetTokenItem };
