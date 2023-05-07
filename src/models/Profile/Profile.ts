import type { FixitUser, Profile as ProfileType } from "@types";

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
export class Profile implements ProfileType {
  displayName: string;
  givenName: string | null;
  familyName: string | null;
  businessName: string | null;
  photoUrl: string | null;

  constructor({
    handle,
    displayName,
    givenName,
    familyName,
    businessName,
    photoUrl,
  }: ProfileCtorArgs) {
    this.givenName = givenName || null;
    this.familyName = familyName || null;
    this.businessName = businessName || null;
    this.photoUrl = photoUrl || null;
    this.displayName = Profile.getDisplayNameFromArgs({
      handle,
      displayName,
      givenName,
      familyName,
      businessName,
    });
  }

  public static readonly getDisplayNameFromArgs = ({
    handle,
    displayName,
    givenName,
    familyName,
    businessName,
  }: ProfileCtorArgs) => {
    return displayName
      ? displayName
      : businessName
      ? businessName
      : givenName
      ? `${givenName}${familyName ? ` ${familyName}` : ""}`
      : handle;
  };
}

export type ProfileCtorArgs = Partial<ProfileType> & {
  handle: FixitUser["handle"];
};
