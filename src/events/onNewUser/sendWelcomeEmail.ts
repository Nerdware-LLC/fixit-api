import { lambdaClient } from "@lib/lambdaClient";
import type { UserModelItem } from "@models/User";

/**
 * Send welcome email to new User when `NewUser` event is emitted.
 * @event NewUser
 * @param {UserModelItem} newUser - The new User
 * @category events
 */
export const sendWelcomeEmail = async (newUser?: UserModelItem) => {
  if (!newUser) return;

  await lambdaClient.invokeEvent("SendWelcomeEmail", {
    id: newUser.id,
    handle: newUser.handle,
    email: newUser.email,
  });
};
