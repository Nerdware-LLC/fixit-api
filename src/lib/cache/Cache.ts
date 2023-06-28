/**
 * The cache entry interface takes an optional type parameter which allows an
 * explicit type to be specified for the stored data. If no type is provided,
 * this defaults to `any`.
 */
export interface CacheEntry<StoredDataType = any> {
  data: StoredDataType;
  expiresAt?: number;
}

export class Cache<StoredDataType = any, CacheKeyType = string> {
  readonly _cache: Map<CacheKeyType, CacheEntry<StoredDataType>>;

  constructor() {
    this._cache = new Map<CacheKeyType, CacheEntry<StoredDataType>>();
  }

  /**
   * Checks the cache for the existence of a key.
   * @param {CacheKeyType} key - The cache key to check.
   * @returns Boolean indicating whether an element with the specified key exists or not.
   */
  has(key: CacheKeyType): boolean {
    return this._cache.has(key);
  }

  /**
   * Retrieves data from the cache.
   * @param {CacheKeyType} key - The cache key under which the data will be stored.
   * @returns {StoredDataType|undefined} The data stored under the provided key, or undefined if no unexpired data is found.
   */
  get(key: CacheKeyType): StoredDataType | undefined {
    const { data, expiresAt } = this._cache.get(key) || {};
    if (!this.isExpiredAndDeleted(key, { expiresAt })) return data;
  }

  /**
   * Retrieves the entire cache as an array of key-value pair tuples.
   * @param {boolean=} shouldCheckTTL - False by default; if true, the cache will be checked for expired entries and they will be removed before returning the cache entries.
   * @returns {[CacheKeyType,StoredDataType][]|undefined}
   */
  entries(shouldCheckTTL: boolean = false): Array<[CacheKeyType, StoredDataType]> | undefined {
    const arrayOfEntries = Array.from(this._cache.entries()); // entries returns an iterator
    // prettier-ignore
    return shouldCheckTTL
      ? arrayOfEntries.reduce(
          (acc: Array<[CacheKeyType, StoredDataType]>, [key, { data, expiresAt }]) => {
            if (!this.isExpiredAndDeleted(key, { expiresAt })) acc.push([key, data]);
            return acc;
          }, [])
      : arrayOfEntries.map(([key, { data }]) => [key, data]);
  }

  /**
   * Stores data in the cache.
   * @param {CacheKeyType} key - The cache key under which the data is stored.
   * @param {StoredDataType} data - The data to be stored.
   * @param {number|undefined} ttl - The time-to-live in milliseconds. If not provided, the data will be stored indefinitely.
   */
  set(key: CacheKeyType, data: StoredDataType, ttl?: number): void {
    this._cache.set(key, {
      data,
      ...(ttl && { expiresAt: Date.now() + ttl }),
    });
  }

  /**
   * Deletes data from the cache.
   * @param {CacheKeyType} key - The key of the data to be deleted.
   */
  delete(key: CacheKeyType): void {
    this._cache.delete(key);
  }

  /**
   * Checks if a cache entry has expired, and deletes it if it has.
   * @param {CacheKeyType} key - The cache key of the entry to check.
   * @param {CacheEntry<StoredDataType>} cacheEntry - The entry to check for TTL expiration.
   * @returns {boolean} True if the entry has expired and been deleted, false otherwise.
   */
  isExpiredAndDeleted(
    key: CacheKeyType,
    { expiresAt }: Partial<CacheEntry<StoredDataType>>
  ): boolean {
    if (!!expiresAt && expiresAt < Date.now()) {
      this._cache.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Clears the cache of all data.
   */
  clear(): void {
    this._cache.clear();
  }

  /**
   * Returns the number of items in the cache.
   */
  get size(): number {
    return this._cache.size;
  }
}
