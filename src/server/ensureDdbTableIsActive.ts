import { ddbTable } from "@/models/ddbTable";

await ddbTable.ensureTableIsActive({
  createIfNotExists: {
    BillingMode: "PROVISIONED",
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
});
