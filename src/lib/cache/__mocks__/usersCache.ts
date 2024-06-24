import { Cache } from "@/lib/cache/Cache.js";
import type { UsersCacheObject } from "@/lib/cache/usersCache.js";

/**
 * MOCK Users Cache
 */
export const usersCache = new Cache<UsersCacheObject>([]);
