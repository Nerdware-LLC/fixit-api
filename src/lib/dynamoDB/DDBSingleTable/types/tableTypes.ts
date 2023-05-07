import type { Simplify } from "type-fest";

export type DDBTableProperties = Simplify<{
  billingMode?: "PROVISIONED" | "PAY_PER_REQUEST";
  provisionedThroughput?: { read: number; write: number };
  // TODO Add CreateTable params: "SSESpecification", "StreamSpecification", "TableClass".
}>;

export type DDBTableIndexes = Record<
  string,
  { name: string; type: "GLOBAL" | "LOCAL"; indexPK: string; indexSK?: string }
>;
