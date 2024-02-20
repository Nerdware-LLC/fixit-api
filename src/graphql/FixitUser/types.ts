import type { User, Contact } from "@/types/graphql";

/**
 * # This type is only for use in the `codegen` config file (see `<repo_root>/codegen.ts`)
 *
 * This type is only used in the `codegen` config file under `"mappers"` to ensure the
 * `@graphql-codegen/typescript-resolvers` package resolves the `FixitUser` interface to
 * the GQL schema-typeDef types, `User | Contact`, rather than the DB-model types
 * `UserItem | ContactItem`.
 */
export type FixitUserCodegenInterface = User | Contact;
