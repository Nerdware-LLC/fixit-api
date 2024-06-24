import { pinpointClient } from "@/lib/pinpointClient";
import { sendWelcomeEmail } from "./sendWelcomeEmail.js";
import type { UserItem } from "@/models/User";

describe("sendWelcomeEmail", () => {
  test("invokes pinpointClient with correct arguments when newUser is valid", async () => {
    const newUser = {
      id: "USER#123",
      handle: "@test_user",
      email: "test_user@example.com",
      profile: {
        displayName: "Test User",
      },
    } as UserItem;

    const sendMessagesSpy = vi.spyOn(pinpointClient, "sendMessages");

    const result = await sendWelcomeEmail(newUser);

    expect(result).toBeUndefined();
    expect(sendMessagesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: newUser.email,
        ChannelType: "EMAIL",
        TemplateConfiguration: {
          EmailTemplate: {
            Name: "new-user-welcome-email",
          },
        },
        MessageConfiguration: {
          EmailMessage: {
            Substitutions: {
              recipientDisplayName: [newUser.profile.displayName],
            },
          },
        },
      })
    );
  });

  test("does not invoke an event when newUser is undefined", async () => {
    const sendMessagesSpy = vi.spyOn(pinpointClient, "sendMessages");

    const result = await sendWelcomeEmail();

    expect(result).toBeUndefined();
    expect(sendMessagesSpy).not.toHaveBeenCalled();
  });
});
