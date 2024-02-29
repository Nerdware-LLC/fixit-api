import { Cache } from "./Cache.js";

describe("Cache", () => {
  describe("cache.set()", () => {
    test("adds a cache entry when called with a valid arg", () => {
      const cache = new Cache();
      const key = "testKey";
      const data = { test: "data" };
      cache.set(key, data);
      expect(cache.get(key)).toStrictEqual(data);
    });
  });

  describe("cache.get()", () => {
    test("retrieves a cache entry when called with an existing key", () => {
      const cache = new Cache();
      const key = "testKey";
      const data = { test: "data" };
      cache.set(key, data);
      expect(cache.get(key)).toStrictEqual(data);
    });
    test("returns undefined when called with a non-existent key", () => {
      const cache = new Cache();
      expect(cache.get("nonExistentKey")).toBeUndefined();
    });
    test("returns undefined when called with an expired key", () => {
      vi.useFakeTimers();
      const cache = new Cache();
      const key = "testKey";
      const data = { test: "data" };
      cache.set(key, data, 1000);
      vi.advanceTimersByTime(2000);
      expect(cache.get(key)).toBeUndefined();
      vi.useRealTimers();
    });
  });

  describe("cache.delete()", () => {
    test("deletes a cache entry when called with an existing key", () => {
      const cache = new Cache();
      const key = "testKey";
      const data = { test: "data" };
      cache.set(key, data);
      cache.delete(key);
      expect(cache.get(key)).toBeUndefined();
    });
  });

  describe("cache.clear()", () => {
    test("clears the cache when called", () => {
      const cache = new Cache();
      const key1 = "testKey1";
      const key2 = "testKey2";
      const data1 = { test: "data1" };
      const data2 = { test: "data2" };
      cache.set(key1, data1);
      cache.set(key2, data2);
      cache.clear();
      expect(cache.get(key1)).toBeUndefined();
      expect(cache.get(key2)).toBeUndefined();
    });
  });
});
