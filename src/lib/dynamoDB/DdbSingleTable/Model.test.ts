import { DdbSingleTable } from "./DdbSingleTable";
import { Model } from "./Model";

vi.mock("@aws-sdk/client-dynamodb"); // <repo_root>/__mocks__/@aws-sdk/client-dynamodb.ts
vi.mock("@aws-sdk/lib-dynamodb"); //    <repo_root>/__mocks__/@aws-sdk/lib-dynamodb.ts

describe("lib > DdbSingleTable > Model", () => {
  it("should create an instance of Model with valid arguments", () => {
    // Arrange
    const table = new DdbSingleTable({
      tableName: "test-table",
      tableKeysSchema: {
        pk: {
          type: "string",
          required: true,
          isHashKey: true,
        },
        sk: {
          type: "string",
          required: true,
          isRangeKey: true,
          index: {
            name: "sk_gsi",
            rangeKey: "data",
            global: true,
            project: true,
            throughput: { read: 5, write: 5 },
          },
        },
        data: {
          type: "string",
          required: true,
          index: {
            name: "data_gsi",
            rangeKey: "sk",
            global: true,
            project: true,
            throughput: { read: 5, write: 5 },
          },
        },
      } as const,
      ddbClientConfigs: {
        region: "local",
        endpoint: "http://localhost:8000",
        credentials: {
          accessKeyId: "local",
          secretAccessKey: "local",
        },
      },
      tableConfigs: {
        createIfNotExists: true,
        billingMode: "PROVISIONED",
        provisionedThroughput: { read: 20, write: 20 },
      },
    });
    const modelName = "TestModel";
    const modelSchema = table.getModelSchema({
      id: { type: "string" },
      name: { type: "string" },
    } as const);

    // Act
    const model = new Model(modelName, modelSchema, table);

    // Assert
    expect(model).toBeInstanceOf(Model);
    expect(model.modelName).toBe(modelName);
    expect(model.schema).toBe(modelSchema);
    expect(model.tableHashKey).toBe(table.tableHashKey);
    expect(model.tableRangeKey).toBe(table.tableRangeKey);
    expect(model.indexes).toBe(table.indexes);
    expect(model.ddbClient).toBe(table.ddbClient);
    expect(model.schemaOptions.allowUnknownAttributes).toBe(false);
  });
});
