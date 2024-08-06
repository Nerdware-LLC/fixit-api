import type { LiteralToPrimitive } from "type-fest";

/**
 * The cache entry interface takes an optional type parameter which allows an
 * explicit type to be specified for the stored data. If no type is provided,
 * this defaults to `any`.
 */
export interface CacheEntry<StoredDataType = NonNullable<unknown>> {
  data: StoredDataType;
  expiresAt?: number | undefined;
}

export class Cache<StoredDataType = NonNullable<unknown>, CacheKeyType = string> {
  protected readonly _cache: Map<CacheKeyType, CacheEntry<StoredDataType>>;

  constructor(initialEntries: Array<[CacheKeyType, StoredDataType]> = []) {
    // Initialize _cache with initial entries:
    this._cache = new Map<CacheKeyType, CacheEntry<StoredDataType>>(
      initialEntries.map(([key, entry]) => [key, this.convertDataToCacheEntry(entry)])
    );
  }

  /**
   * Converts arbitrary data to a cache entry object.
   * @param {StoredDataType} data - The data to be stored.
   * @param {number|undefined} ttl - The time-to-live in milliseconds. If not provided, the data will be stored indefinitely.
   */
  protected readonly convertDataToCacheEntry = (
    data: StoredDataType,
    ttl?: number
  ): CacheEntry<StoredDataType> => {
    return {
      data,
      ...(ttl && { expiresAt: Date.now() + ttl }),
    };
  };

  /**
   * Checks if a cache entry has expired, and deletes it if it has.
   * @param {CacheKeyType} key - The cache key of the entry to check.
   * @param {CacheEntry<StoredDataType>} cacheEntry - The entry to check for TTL expiration.
   * @returns {boolean} True if the entry has expired and been deleted, false otherwise.
   */
  protected readonly isExpiredAndDeleted = (
    key: CacheKeyType,
    { expiresAt }: Partial<CacheEntry<StoredDataType>>
  ): boolean => {
    if (!!expiresAt && expiresAt < Date.now()) {
      this._cache.delete(key);
      return true;
    }
    return false;
  };

  /**
   * This method filters out expired cache entries, and then maps each entry
   * into the shape returned by the provided `entryMapper` function. For example,
   * if the caller wants the keys of all non-expired cache entries, they could
   * pass `([entryKey, entryValue]) => entryKey` as the `entryMapper` function.
   */
  protected readonly filterCacheEntries = <EntryMapperReturnType>(
    entryMapper: (entry: [CacheKeyType, StoredDataType]) => EntryMapperReturnType,
    cacheEntries: Array<[CacheKeyType, CacheEntry<StoredDataType>]> = Array.from(
      this._cache.entries()
    )
  ) => {
    return cacheEntries.reduce((acc: Array<EntryMapperReturnType>, [key, { data, expiresAt }]) => {
      if (!this.isExpiredAndDeleted(key, { expiresAt })) {
        acc.push(entryMapper([key, data]));
      }
      return acc;
    }, []);
  };

  /**
   * Checks the cache for the existence of a key.
   * @param {CacheKeyType} key - The cache key to check.
   * @returns Boolean indicating whether an element with the specified key exists or not.
   */
  readonly has = (key: CacheKeyType | LiteralToPrimitive<CacheKeyType>): boolean => {
    return this._cache.has(key as CacheKeyType);
  };

  /**
   * Retrieves data from the cache.
   * @param {CacheKeyType} key - The cache key to use to retrieve the data.
   * @returns {StoredDataType|undefined} The data stored under the provided key, or undefined if no unexpired data is found.
   */
  readonly get = (
    key: CacheKeyType | LiteralToPrimitive<CacheKeyType>
  ): StoredDataType | undefined => {
    const { data, expiresAt } = this._cache.get(key as CacheKeyType) ?? {};
    if (!this.isExpiredAndDeleted(key as CacheKeyType, { expiresAt })) return data;
  };

  /**
   * Stores data in the cache.
   * @param {CacheKeyType} key - The cache key under which the data is stored.
   * @param {StoredDataType} data - The data to be stored.
   * @param {number|undefined} ttl - The time-to-live in milliseconds. If not provided, the data will be stored indefinitely.
   */
  readonly set = (key: CacheKeyType, data: StoredDataType, ttl?: number): void => {
    this._cache.set(key, this.convertDataToCacheEntry(data, ttl));
  };

  /**
   * Deletes data from the cache.
   * @param {CacheKeyType} key - The key of the data to be deleted.
   */
  readonly delete = (key: CacheKeyType): void => {
    this._cache.delete(key);
  };

  /**
   * Clears the cache of all data.
   */
  readonly clear = (): void => {
    this._cache.clear();
  };

  /**
   * Retrieves all cache keys as an array.
   * @param {boolean=} shouldCheckTTL - False by default; if true, the cache will be checked for expired entries and they will be removed before returning the cache keys.
   * @returns {CacheKeyType[]}
   */
  readonly keys = (shouldCheckTTL: boolean = false): Array<CacheKeyType> => {
    return shouldCheckTTL
      ? this.filterCacheEntries(([key]) => key)
      : Array.from(this._cache.keys());
  };

  /**
   * Retrieves all cache values as an array.
   * @param {boolean=} shouldCheckTTL - False by default; if true, the cache will be checked for expired entries and they will be removed before returning the cache values.
   * @returns {StoredDataType[]}
   */
  readonly values = (shouldCheckTTL: boolean = false): Array<StoredDataType> => {
    return shouldCheckTTL
      ? this.filterCacheEntries(([_key, value]) => value)
      : Array.from(this._cache.values()).map(({ data }) => data);
  };

  /**
   * Retrieves the entire cache as an array of key-value pair tuples.
   * @param {boolean=} shouldCheckTTL - False by default; if true, the cache will be checked for expired entries and they will be removed before returning the cache entries.
   * @returns {[CacheKeyType,StoredDataType][]}
   */
  readonly entries = (shouldCheckTTL: boolean = false): Array<[CacheKeyType, StoredDataType]> => {
    return shouldCheckTTL
      ? this.filterCacheEntries(([key, value]) => [key, value])
      : Array.from(this._cache.entries()).map(([key, { data }]) => [key, data]);
  };

  /**
   * Returns the number of items in the cache.
   */
  get size(): number {
    return this._cache.size;
  }
}
