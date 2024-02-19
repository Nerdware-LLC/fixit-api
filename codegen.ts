import { CodegenConfig } from "@graphql-codegen/cli";

/**
 * ### `@graphql-codegen` config file
 *
 * This file is used by the `@graphql-codegen/cli` package to generate
 * TypeScript types for GQL Schema typeDefs and resolvers.
 *
 * - Docs for `@graphql-codegen`:
 *   - https://graphql-code-generator.com/docs/getting-started/codegen-config
 *   - https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config#other-ways-to-provide-configuration
 *
 * - Docs for plugin `typescript-resolvers`:
 *   - https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-resolvers
 */
const codegenConfig: CodegenConfig = {
  schema: "src/graphql/**/typeDefs.ts",
  emitLegacyCommonJSImports: false,
  generates: {
    // This objects keys are Codegen output target files
    "src/types/__codegen__/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      // Plugin configs:
      config: {
        enumsAsTypes: true,
        useIndexSignature: true,
        useTypeImports: true,
        // resolver context type:
        contextType: "@/apolloServer#ApolloServerResolverContext",
        scalars: {
          ID: "string",
          DateTime: "Date",
          Email: "string",
        },
        // `mappers` type overrides:
        mappers: {
          User: "@/models/User/User#UserItem",
          Contact: "@/models/Contact/Contact#ContactItem",
          FixitUser: "@/graphql/FixitUser/types#FixitUserCodegenInterface",
          Invoice: "@/models/Invoice/Invoice#InvoiceItem",
          WorkOrder: "@/models/WorkOrder/WorkOrder#WorkOrderItem",
          UserSubscription: "@/models/UserSubscription/UserSubscription#UserSubscriptionItem",
          UserStripeConnectAccount:
            "@/models/UserStripeConnectAccount/UserStripeConnectAccount#UserStripeConnectAccountItem",
        },
      },
    },
  },
};

export default codegenConfig;
