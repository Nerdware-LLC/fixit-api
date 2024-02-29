import { lambdaClient } from "@/lib/lambdaClient/index.js";
import type { UserItem } from "@/models/User/User.js";

/**
 * Send welcome email to new User when `NewUser` event is emitted.
 * @event NewUser
 * @param {UserItem} newUser - The new User
 * @category events
 */
export const sendWelcomeEmail = async (newUser?: UserItem) => {
  if (!newUser) return;

  await lambdaClient.invokeEvent("SendWelcomeEmail", {
    id: newUser.id,
    handle: newUser.handle,
    email: newUser.email,
  });
};
