import { refreshDataFromStripe } from "./refreshDataFromStripe.js";
import { registerNewUserSCA } from "./registerNewUserSCA.js";

/**
 * #### UserSCAService
 *
 * This object contains methods which implement business logic for operations
 * related to User Stripe Connect Accounts.
 */
export const UserSCAService = {
  refreshDataFromStripe,
  registerNewUserSCA,
} as const;
