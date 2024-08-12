import type { User, Contact } from "@/types/graphql.js";

/**
 * This type is only for use in the `codegen` config file (see `<repo_root>/codegen.ts`)
 *
 * This type is only used in the `codegen` config file under the `"mappers"` config to ensure
 * the `@graphql-codegen/typescript-resolvers` pkg resolves the `PublicUserFields` interface to
 * the GQL schema types, `User | Contact`, rather than the DB-model types `UserItem | ContactItem`.
 */
export type PublicUserFieldsCodegenInterface = User | Contact;
