import { Cache } from "./Cache";
import type { User, Contact } from "@/types";
import type { Simplify } from "type-fest";

/**
 * Fixit API local cache instance for searching Users by `User.handle`.
 *
 * > Only public "Contact" fields are stored.
 */
export const usersCache = new Cache<Simplify<Pick<User, keyof Contact>>>();
