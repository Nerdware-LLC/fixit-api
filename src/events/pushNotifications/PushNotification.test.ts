import { PushNotification } from "./PushNotification.js";

describe("PushNotification", () => {
  test("creates a new instance of PushNotification with all required parameters", () => {
    const input = {
      pushEventName: "testPushEvent",
      recipientUser: { id: "testUserID", expoPushToken: "testPushToken" },
      title: "Test Title",
      body: "Test Body",
    };

    const result = new PushNotification(input);

    expect(result).toBeInstanceOf(PushNotification);
    expect(result.to).toBe(input.recipientUser.expoPushToken);
    expect(result.title).toBe(input.title);
    expect(result.body).toBe(input.body);
    expect(result.data._apiEnv).toBe("test");
    expect(result.data._recipientUser).toBe(input.recipientUser.id);
    expect(result.data._pushEventName).toBe(input.pushEventName);
  });
});
