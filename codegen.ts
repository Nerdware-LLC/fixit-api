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
        useTypeImports: true,
        useIndexSignature: true,
        defaultMapper: "Partial<{T}>",

        // resolver context type:
        contextType: "@/apolloServer.js#ApolloServerContext",
        scalars: {
          ID: "string",
          DateTime: "Date",
          Email: "string",
        },

        // `mappers` type overrides:
        mappers: {
          Contact: "@/models/Contact/Contact.js#ContactItem",
          PublicUserFields: "@/graphql/PublicUserFields/types.js#PublicUserFieldsCodegenInterface",
          Invoice: "@/models/Invoice/Invoice.js#InvoiceItem",
          WorkOrder: "@/models/WorkOrder/WorkOrder.js#WorkOrderItem",
          UserSubscription: "@/models/UserSubscription/UserSubscription.js#UserSubscriptionItem",
          UserStripeConnectAccount:
            "@/models/UserStripeConnectAccount/UserStripeConnectAccount.js#UserStripeConnectAccountItem",
        },
      },
    },
  },
};

export default codegenConfig;
