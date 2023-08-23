import { logger, isRecordObject } from "@/utils";
import { DdbSingleTable } from "./DdbSingleTable";
import { DdbSingleTableError, DdbConnectionError } from "./utils";
import type { SetNonNullable, SetRequired } from "type-fest";
import type { TableKeysSchemaType, CreateTableOpts } from "./types";

export const ensureTableIsActive = async function <TableKeysSchema extends TableKeysSchemaType>(
  this: InstanceType<typeof DdbSingleTable<TableKeysSchema>>
) {
  // Skip execution if waitForActive is disabled or isTableActive was initialized as true.
  if (this.waitForActive.enabled !== true || this.isTableActive) return;

  // Start timeout timer that throws error if not cleared within the timeframe.
  const timeoutTimerID = setTimeout(() => {
    throw new DdbSingleTableError(
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
        this.isTableActive = true;
        break;
      }

      logger.dynamodb(
        `Table "${this.tableName}" is not ACTIVE. Current table status: ${TableStatus ?? "UNKNOWN"}`
      );

      // Wait then try again
      await new Promise((resolve) => {
        setTimeout(resolve, this.waitForActive.frequency);
      });
    } catch (err: unknown) {
      // Sanity type-check: if `err` somehow does not contain K-V fields, just throw it.
      if (!isRecordObject(err)) throw err;

      // If `err?.code` is "ECONNREFUSED", a connection could not be made to the provided endpoint.
      if (err?.code === "ECONNREFUSED") throw new DdbConnectionError(err);

      // If `err` is a "ResourceNotFoundException", Table doesn't exist - see if it should be created.
      if (err?.name !== "ResourceNotFoundException") throw err;

      // Inform user Table *probably* doesn't exist
      logger.dynamodb(`Table "${this.tableName}" not found.`);

      // If Table doesn't exist AND tableConfigs.createIfNotExists != true, throw error.
      if (this.tableConfigs.createIfNotExists !== true) {
        throw new DdbSingleTableError(
          `Invalid tableConfigs: createIfNotExists is "false" and Table does not exist.`
        );
      }

      // If createTable has already been called, continue for loop.
      if (hasCreateTableBeenCalled === true) continue;

      // Else attempt to create the Table.
      logger.dynamodb(`Creating Table "${this.tableName}" ...`);

      // Make `CreateTable` args from the provided schema
      const createTableArgsFromSchema = Object.entries(this.tableKeysSchema).reduce(
        (accum: CreateTableArgsReducerAccumulator, [keyAttrName, keyAttrConfig]) => {
          const {
            type: keyAttrType,
            isHashKey: isTableHashKey = false,
            isRangeKey: isTableRangeKey = false,
            index,
          } = keyAttrConfig;

          accum.AttributeDefinitions.push({
            AttributeName: keyAttrName,
            AttributeType: keyAttrType === "string" ? "S" : keyAttrType === "number" ? "N" : "B",
            // keys can only be strings, numbers, or binary
          });

          // Table hash+range keys
          if (isTableHashKey || isTableRangeKey) {
            accum.KeySchema.push({
              AttributeName: keyAttrName,
              KeyType: isTableHashKey === true ? "HASH" : "RANGE",
            });
          }

          // Indexes
          if (index) {
            // Ensure index name was provided, else throw error.
            if (!index?.name) {
              throw new DdbSingleTableError("Invalid keys schema: every index must have a name");
            }

            // Determine GSI or LSI, then push to the respective array in the accum.
            const indexArray =
              index?.global === true ? accum.GlobalSecondaryIndexes : accum.LocalSecondaryIndexes;

            indexArray.push({
              IndexName: index.name,
              KeySchema: [
                {
                  AttributeName: keyAttrName,
                  KeyType: "HASH",
                },
                ...(index?.rangeKey ? [{ AttributeName: index.rangeKey, KeyType: "RANGE" }] : []),
              ],
              Projection: {
                ProjectionType: !index?.project // if undefined or false, default "KEYS_ONLY"
                  ? "KEYS_ONLY"
                  : index.project === true
                  ? "ALL"
                  : "INCLUDE",
                ...(Array.isArray(index.project) && { NonKeyAttributes: index.project }),
              },
              ...(!!index?.throughput && {
                ProvisionedThroughput: {
                  ReadCapacityUnits: index.throughput.read,
                  WriteCapacityUnits: index.throughput.write,
                },
              }),
            });
          }

          return accum;
        },
        // prettier-ignore
        { AttributeDefinitions: [], KeySchema: [], GlobalSecondaryIndexes: [], LocalSecondaryIndexes: [] }
      );

      // Create the table (TableName is provided to the CreateTable cmd by the SingleTable client)
      const { TableStatus } = await this.ddbClient.createTable({
        ...(this.tableConfigs?.billingMode && {
          BillingMode: this.tableConfigs.billingMode,
        }),
        ...(this.tableConfigs?.provisionedThroughput && {
          ProvisionedThroughput: {
            ReadCapacityUnits: this.tableConfigs.provisionedThroughput.read,
            WriteCapacityUnits: this.tableConfigs.provisionedThroughput.write,
          },
        }),
        ...createTableArgsFromSchema,
      });

      // Update this bool flag so ensure CreateTable is only ever called once.
      hasCreateTableBeenCalled = true;

      logger.dynamodb(
        `CreateTable operation complete. Current table status: ${TableStatus ?? "UNKNOWN"}`
      );

      // TableStatus is possibly already ACTIVE if using ddb-local.
      if (TableStatus === "ACTIVE") {
        clearTimeout(timeoutTimerID);
        this.isTableActive = true;
        break;
      }
    }
  }
};

/**
 * This union reflects the keys of the initial accumulator object provided to the
 * reduce method that's used to derive `createTableArgsFromSchema`.
 */
type CreateTableArgsReducerAccumKeys = Extract<
  keyof CreateTableOpts,
  "AttributeDefinitions" | "KeySchema" | "GlobalSecondaryIndexes" | "LocalSecondaryIndexes"
>;

/**
 * This type reflects the initial accumulator object provided to the reduce method
 * that's used to derive `createTableArgsFromSchema`.
 *
 * Since the keys in `CreateTableArgsReducerAccumKeys` are hard-coded, they're provided
 * to both `SetRequired` and `SetNonNullable` so TS knows they're definitely there.
 */
type CreateTableArgsReducerAccumulator = SetRequired<
  SetNonNullable<CreateTableOpts, CreateTableArgsReducerAccumKeys>,
  CreateTableArgsReducerAccumKeys
>;
