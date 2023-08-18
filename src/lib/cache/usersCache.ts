import { Cache } from "./Cache";
import type { Contact } from "@/types";

/**
 * Fixit API local cache instance for searching Users by `User.handle`.
 */
export const usersCache = new Cache<Contact>();
