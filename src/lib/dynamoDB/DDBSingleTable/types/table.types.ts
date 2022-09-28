export type DDBTableProperties = Expand<{
  billingMode?: "PROVISIONED" | "PAY_PER_REQUEST";
  // TODO Add CreateTable params: "ProvisionedThroughput", "SSESpecification", "StreamSpecification", "TableClass".
}>;

export type DDBTableIndexes = Record<
  string,
  { name: string; type: "GLOBAL" | "LOCAL"; indexPK: string; indexSK?: string }
>;
