import { Profile, type CreateProfileParams } from "./Profile.js";

/** Valid ProfileParams */
const PROFILE_ARGS: CreateProfileParams = {
  handle: "@test_handle",
  displayName: "Person McHumanPerson",
  givenName: "Person",
  familyName: "McHumanPerson",
  businessName: "Foo Business Inc.",
  photoUrl: "s3://test-photo-url",
};

describe("Profile", () => {
  describe("new Profile()", () => {
    test("returns a valid Profile instance when called with all params", () => {
      const result = new Profile(PROFILE_ARGS);
      expect(result).toBeInstanceOf(Profile);
      expect(result.displayName).toBe(PROFILE_ARGS.displayName);
      expect(result.givenName).toBe(PROFILE_ARGS.givenName);
      expect(result.familyName).toBe(PROFILE_ARGS.familyName);
      expect(result.businessName).toBe(PROFILE_ARGS.businessName);
      expect(result.photoUrl).toBe(PROFILE_ARGS.photoUrl);
    });

    test(`returns a valid Profile instance when called with just the "handle" param`, () => {
      const result = new Profile({ handle: PROFILE_ARGS.handle });
      expect(result).toBeInstanceOf(Profile);
      expect(result.displayName).toBe(PROFILE_ARGS.handle);
      expect(result.givenName).toBeUndefined();
      expect(result.familyName).toBeUndefined();
      expect(result.businessName).toBeUndefined();
      expect(result.photoUrl).toBeUndefined();
    });

    describe("Profile.getDisplayName()", () => {
      test(`uses desired order of precedence to determine "displayName" value`, () => {
        // ORDER: displayName > bizName > givenName+(familyName:?) > handle
        const { displayName, businessName, givenName, familyName, handle } = PROFILE_ARGS;

        // handle only => displayName should be handle
        expect(Profile.getDisplayName({ handle })).toBe(handle);
        // handle + familyName => no givenName, so displayName should still be handle
        expect(Profile.getDisplayName({ handle, familyName })).toBe(handle);
        // handle + givenName => givenName
        expect(Profile.getDisplayName({ handle, givenName })).toBe(givenName);
        // handle + givenName + familyName => displayName should take the form "givenName familyName"
        expect(Profile.getDisplayName({ handle, familyName, givenName })).toBe(`${givenName!} ${familyName!}`); // prettier-ignore
        // handle + givenName + familyName + bizName => bizName
        expect(Profile.getDisplayName({ handle, familyName, givenName, businessName })).toBe(businessName); // prettier-ignore
        // all params with explicit displayName => displayName
        expect(Profile.getDisplayName(PROFILE_ARGS)).toBe(displayName);
      });
    });
  });
});
