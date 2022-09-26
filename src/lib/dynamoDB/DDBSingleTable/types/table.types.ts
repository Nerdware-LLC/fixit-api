export type DDBTableProperties = Expand<{
  billingMode?: "PROVISIONED" | "PAY_PER_REQUEST";
  // TODO Add CreateTable params: "ProvisionedThroughput", "SSESpecification", "StreamSpecification", "TableClass".
}>;
