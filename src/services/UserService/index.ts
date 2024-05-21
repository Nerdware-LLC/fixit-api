import { queryUserItems } from "./queryUserItems.js";
import { registerNewUser } from "./registerNewUser.js";

/**
 * #### UserService
 *
 * This object contains methods which implement business logic for User operations.
 */
export const UserService = {
  queryUserItems,
  registerNewUser,
} as const;
