import { lambdaClient } from "@/lib/lambdaClient";
import { sendWelcomeEmail } from "./sendWelcomeEmail";
import type { UserItem } from "@/models/User";

describe("sendWelcomeEmail", () => {
  test("invokes lambdaClient with correct arguments when newUser is valid", async () => {
    const newUser = {
      id: "USER#123",
      handle: "@test_user",
      email: "test_user@example.com",
    } as UserItem;
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await sendWelcomeEmail(newUser);

    expect(result).toBeUndefined();
    expect(invokeEventSpy).toHaveBeenCalledWith("SendWelcomeEmail", newUser);
  });

  test("does not invoke an event when newUser is undefined", async () => {
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await sendWelcomeEmail();

    expect(result).toBeUndefined();
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});
