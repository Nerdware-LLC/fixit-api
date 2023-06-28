export type DdbTableProperties = {
  billingMode?: "PROVISIONED" | "PAY_PER_REQUEST";
  provisionedThroughput?: {
    read: number;
    write: number;
  };
  // IDEA Add CreateTable params: "SSESpecification", "StreamSpecification", "TableClass".
};

export type DdbTableIndexes = Record<
  string,
  {
    name: string;
    type: "GLOBAL" | "LOCAL";
    indexPK: string;
    indexSK?: string;
  }
>;
