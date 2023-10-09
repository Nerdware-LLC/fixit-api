import type {
  FixitUser,
  Profile as NullableProfile,
  NonNullableProfile,
  UnwrapGqlMaybeType,
} from "@/types";
import type { Simplify } from "type-fest";

/**
 * // IDEA Ideas for potential profile fields:
 * - businessAddress
 * - businessPhone
 * - businessWebsite
 * - businessEmail
 * - businessDescription
 * - businessCategories
 * - businessHours
 * - businessServices
 * - businessPaymentMethods
 * - businessPaymentTerms
 * - businessPaymentNotes
 * - businessLicenses
 * - businessInsurance
 * - businessW9
 * - businessW9Date
 * - businessW9Notes
 * - businessNotes
 */
export class Profile implements NonNullableProfile {
  displayName: string;
  givenName?: string;
  familyName?: string;
  businessName?: string;
  photoUrl?: string;

  /**
   * Returns a `Profile.displayName` value based on the following order of precedence:
   *   1. `displayName` — Takes top precedence if explicitly provided
   *   2. `businessName`
   *   3. `givenName + familyName` — If both are provided
   *   4. `givenName` — If just givenName is provided
   *   5. `handle` — The fallback value if no other values are provided
   */
  static readonly getDisplayName = ({
    handle,
    displayName,
    givenName,
    familyName,
    businessName,
  }: ProfileParams) => {
    return displayName
      ? displayName
      : businessName
      ? businessName
      : givenName
      ? `${givenName}${familyName ? ` ${familyName}` : ""}`
      : handle
      ? handle
      : "";
  };

  /**
   * Returns a `Profile`-shaped object from the given params.
   */
  static readonly fromParams = (params: ProfileParams) => new Profile(params);

  constructor({
    handle,
    displayName,
    givenName,
    familyName,
    businessName,
    photoUrl,
  }: ProfileParams) {
    if (givenName) this.givenName = givenName;
    if (familyName) this.familyName = familyName;
    if (businessName) this.businessName = businessName;
    if (photoUrl) this.photoUrl = photoUrl;

    this.displayName = Profile.getDisplayName({
      handle,
      displayName,
      givenName,
      familyName,
      businessName,
    });
  }
}

/** The parameters that go into creating a new `Profile` object. */
export type ProfileParams = Simplify<
  Partial<UnwrapGqlMaybeType<NullableProfile> & Pick<FixitUser, "handle">>
>;
