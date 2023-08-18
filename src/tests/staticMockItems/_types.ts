/**
 * Internal type used for collections of mock items.
 * ```ts
 * // Example usage:
 * const MOCK_USERS: MocksCollection<"User", { id: string }> = {
 *   USER_A: { id: "foo_user_1" },
 *   USER_B: { id: "foo_user_2" },
 *   USER_C: { id: "foo_user_3" },
 * };
 * ```
 */
export type MocksCollection<
  TypeName extends string,
  ItemType extends Record<string, unknown>
> = Readonly<
  Record<MocksCollectionKey<TypeName>, Required<ItemType>> & {
    [key: string]: Required<ItemType>; // <-- index sig to allow lookups with arbitrary keys
  }
>;

/**
 * Internal type used for the _keys_ of mock-collection objects.
 * ```ts
 * type UserKey = MocksCollectionKey<"User"> // "USER_A" | "USER_B" | "USER_C"
 * ```
 */
export type MocksCollectionKey<TypeName extends string> = `${Uppercase<TypeName>}_${
  | "A"
  | "B"
  | "C"}`;
