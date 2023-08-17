import { UUID_V1_REGEX } from "./regex";
import { getUnixTimestampUUID } from "./uuid";

describe("getUnixTimestampUUID()", () => {
  test("returns a valid v1-UUID string", () => {
    const result = getUnixTimestampUUID();
    expect(result).toMatch(UUID_V1_REGEX);
  });

  test("returns a valid v1-UUID when the date arg is in the far future (year 3000)", () => {
    const result = getUnixTimestampUUID(new Date(3000, 0));
    expect(result).toMatch(UUID_V1_REGEX);
  });

  test("returns a valid v1-UUID when the date arg is in the far past (year 1500)", () => {
    const result = getUnixTimestampUUID(new Date(1500, 0));
    expect(result).toMatch(UUID_V1_REGEX);
  });

  test("returns different UUIDs for calls with the same timestamp", () => {
    const timestamp = new Date();
    const result1 = getUnixTimestampUUID(timestamp);
    const result2 = getUnixTimestampUUID(timestamp);
    expect(result1).not.toEqual(result2);
  });
});
