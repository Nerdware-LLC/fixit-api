import { randomBytes } from "crypto";
import { Model } from "@nerdware/ddb-single-table";
import { isValidHex } from "@nerdware/ts-string-helpers";
import dayjs from "dayjs";
import { userModelHelpers } from "@/models/User/helpers.js";
import { COMMON_ATTRIBUTES } from "@/models/_common/modelAttributes.js";
import { ddbTable } from "@/models/ddbTable.js";
import { passwordResetTokenModelHelpers } from "./helpers.js";
import type { ItemTypeFromSchema, ItemCreationParameters } from "@nerdware/ddb-single-table";

/**
 * PasswordResetToken Model
 *
 * > **TTL = 15 minutes**
 */
class PasswordResetTokenModel extends Model<typeof PasswordResetTokenModel.schema> {
  static readonly ENCODING: BufferEncoding = "hex";
  static readonly BYTE_LENGTH: number = 48;
  static readonly CHAR_LENGTH: number = PasswordResetTokenModel.BYTE_LENGTH * 2; // 1 hex byte = 2 chars

  static readonly schema = ddbTable.getModelSchema({
    pk: {
      type: "string",
      alias: "token",
      default: () =>
        randomBytes(PasswordResetTokenModel.BYTE_LENGTH).toString(PasswordResetTokenModel.ENCODING),
      required: true,
    },
    sk: {
      type: "string",
      default: (pwResetToken: { pk: string }) =>
        pwResetToken?.pk ? passwordResetTokenModelHelpers.sk.format(pwResetToken.pk) : undefined,
      validate: passwordResetTokenModelHelpers.sk.isValid,
      required: true,
    },
    data: {
      type: "string",
      default: (pwResetToken: { pk?: string }) =>
        pwResetToken?.pk ? `#DATA#${pwResetToken.pk}` : undefined,
      required: true,
    },
    userID: {
      type: "string",
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    expiresAt: {
      ...COMMON_ATTRIBUTES.TTL.expiresAt,
      default: () => dayjs().add(15, "minutes").unix(), // expires 15 minutes from now
      required: true,
    },
  } as const);

  /**
   * Returns a boolean indicating whether `token` has the correct encoding and length.
   * > Use this for validating raw token strings from the client.
   */
  static readonly isRawTokenProperlyEncoded = (token: string) => {
    return isValidHex(token) && token.length === PasswordResetTokenModel.CHAR_LENGTH;
  };

  /**
   * Returns a boolean indicating whether `token` is valid (i.e., exists and hasn't expired).
   * > Use this for checking a token once it has been retrieved from the database.
   */
  static readonly isTokenValid = (
    token?: PasswordResetTokenItem
  ): token is PasswordResetTokenItem => {
    return !!token && dayjs(token.expiresAt).isBefore(dayjs());
  };

  constructor() {
    super("PasswordResetToken", PasswordResetTokenModel.schema, ddbTable);
  }

  // PASSWORD RESET TOKEN — Instance methods:
  readonly isRawTokenProperlyEncoded = PasswordResetTokenModel.isRawTokenProperlyEncoded;
  readonly isTokenValid = PasswordResetTokenModel.isTokenValid;
}

export const PasswordResetToken = new PasswordResetTokenModel();

/**
 * The shape of a `PasswordResetToken` object returned from Model methods.
 */
export type PasswordResetTokenItem = ItemTypeFromSchema<typeof PasswordResetTokenModel.schema>;

/**
 * `PasswordResetToken` item params for `createItem()`.
 */
export type PasswordResetTokenItemCreationParams = ItemCreationParameters<
  typeof PasswordResetTokenModel.schema
>;
