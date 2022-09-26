import { logger } from "@utils/logger";
import { DDBSingleTable } from "./DDBSingleTable";
import { DDBSingleTableError } from "./customErrors";
import type { TableKeysSchemaType } from "./types";

export const ensureTableIsActive = async function <TableKeysSchema extends TableKeysSchemaType>(
  this: InstanceType<typeof DDBSingleTable<TableKeysSchema>>
) {
  // Skip execution if waitForActive is disabled.
  if (this.waitForActive.enabled !== true) return;

  // Start timeout timer that throws error if not cleared within the timeframe.
  const timeoutTimerID = setTimeout(() => {
    throw new DDBSingleTableError(
      `ensureTableIsActive has timed out after ${this.waitForActive.timeout} seconds.`
    );
  }, this.waitForActive.timeout);

  // Local state var to ensure CreateTable isn't called more than once.
  let hasCreateTableBeenCalled = false;

  // Try to get TableStatus, ensure it's ACTIVE.
  for (let i = 0; i < this.waitForActive.maxAttempts; i++) {
    try {
      // DescribeTable will throw if Table doesn't exists
      const { TableStatus } = await this.ddbClient.describeTable();

      if (TableStatus === "ACTIVE") {
        clearTimeout(timeoutTimerID);
        break;
      }

      logger.dynamodb(
        `Table "${this.tableName}" is not ACTIVE. Current table status: ${TableStatus}`
      );

      // Wait then try again
      await new Promise((resolve) => {
        setTimeout(resolve, this.waitForActive.frequency);
      });
    } catch (err: ErrorLike) {
      // If `e` is a "ResourceNotFoundException", Table doesn't exist - see if it should be created.
      if (!(err instanceof Error) || err?.name !== "ResourceNotFoundException") throw err;

      // Inform user Table *probably* doesn't exist
      logger.dynamodb(`Table "${this.tableName}" not found.`);

      // If Table doesn't exist AND tableConfigs.createIfNotExists != true, throw error.
      if (this.tableConfigs.createIfNotExists !== true) {
        throw new DDBSingleTableError(
          `Invalid tableConfigs: createIfNotExists is "false" and Table does not exist.`
        );
      }

      // If createTable has already been called, continue for loop.
      if (hasCreateTableBeenCalled === true) continue;

      // Else attempt to create the Table.
      logger.dynamodb(`Creating Table "${this.tableName}" ...`);

      type ReducerAccum = NonNullableKeys<
        Parameters<typeof this.ddbClient.createTable>[0],
        "AttributeDefinitions" | "KeySchema" | "GlobalSecondaryIndexes" | "LocalSecondaryIndexes"
      >; // These keys are NonNullable because they're included the the reducer's initial accum object.

      // Make `CreateTable` args from the provided schema
      const createTableArgsFromSchema = Object.entries(this.tableKeysSchema).reduce<ReducerAccum>(
        (accum, [keyAttrName, keyAttrConfig]) => {
          const {
            type: keyAttrType,
            isHashKey: isTableHashKey = false,
            isRangeKey: isTableRangeKey = false,
            index
          } = keyAttrConfig;

          accum.AttributeDefinitions.push({
            AttributeName: keyAttrName,
            AttributeType: keyAttrType === "string" ? "S" : keyAttrType === "number" ? "N" : "B"
            // keys can only be strings, numbers, or binary
          });

          // Table hash+range keys
          if (isTableHashKey || isTableRangeKey) {
            accum.KeySchema.push({
              AttributeName: keyAttrName,
              KeyType: isTableHashKey === true ? "HASH" : "RANGE"
            });
          }

          // Indexes
          if (index) {
            // Ensure index name was provided, else throw error.
            if (!index?.name) {
              throw new DDBSingleTableError("Invalid keys schema: every index must have a name");
            }

            // Determine GSI or LSI, then push to the respective array in the accum.
            const indexArray =
              index?.global === true ? accum.GlobalSecondaryIndexes : accum.LocalSecondaryIndexes;

            indexArray.push({
              IndexName: index.name,
              KeySchema: [
                {
                  AttributeName: keyAttrName,
                  KeyType: "HASH"
                },
                ...(!!index?.rangeKey ? [{ AttributeName: index.rangeKey, KeyType: "RANGE" }] : [])
              ],
              Projection: {
                ProjectionType: !index?.project // if undefined or false, default "KEYS_ONLY"
                  ? "KEYS_ONLY"
                  : index.project === true
                  ? "ALL"
                  : "INCLUDE",
                ...(Array.isArray(index.project) && { NonKeyAttributes: index.project })
              },
              ...(!!index?.throughput && {
                ProvisionedThroughput: {
                  ReadCapacityUnits: index.throughput.read,
                  WriteCapacityUnits: index.throughput.write
                }
              })
            });
          }

          return accum;
        },
        // prettier-ignore
        { AttributeDefinitions: [], KeySchema: [], GlobalSecondaryIndexes: [], LocalSecondaryIndexes: [] }
      );

      // Create the table (TableName is provided to the CreateTable cmd by the SingleTable client)
      const { TableStatus } = await this.ddbClient.createTable({
        ...(this.tableConfigs?.billingMode && { BillingMode: this.tableConfigs.billingMode }),
        ...createTableArgsFromSchema
      });

      // Update this bool flag so ensure CreateTable is only ever called once.
      hasCreateTableBeenCalled = true;

      logger.dynamodb(`CreateTable operation complete. Current table status: ${TableStatus}`);

      // TableStatus is possibly already ACTIVE if using ddb-local.
      if (TableStatus === "ACTIVE") {
        clearTimeout(timeoutTimerID);
        break;
      }
    }
  }
};
