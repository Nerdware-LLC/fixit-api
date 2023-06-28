import type { FixitUser, Profile as NullableProfile, NonNullableProfile } from "@types";

/**
 * Ideas for potential profile fields:
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

  static readonly getDisplayNameFromArgs = ({
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
      : handle;
  };

  static readonly createProfile = (params: ProfileParams) => new Profile(params);

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

    this.displayName = Profile.getDisplayNameFromArgs({
      handle,
      displayName,
      givenName,
      familyName,
      businessName,
    });
  }
}

/** The parameters that go into creating a new `Profile` object. */
export type ProfileParams = Partial<NullableProfile> & Pick<FixitUser, "handle">;
