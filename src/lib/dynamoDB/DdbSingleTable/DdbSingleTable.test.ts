import { DdbSingleTable } from "./DdbSingleTable";
import { Model } from "./Model";
import { SchemaValidationError, DdbSingleTableError } from "./utils";

vi.mock("@aws-sdk/client-dynamodb"); // <repo_root>/__mocks__/@aws-sdk/client-dynamodb.ts
vi.mock("@aws-sdk/lib-dynamodb"); //    <repo_root>/__mocks__/@aws-sdk/lib-dynamodb.ts

describe("DdbSingleTable", () => {
  describe("new DdbSingleTable()", () => {
    test("returns instance of DdbSingleTable when called with valid ctor args", () => {
      const table = new DdbSingleTable({
        tableName: "TestTable",
        tableKeysSchema: {
          partitionKey: { type: "string", isHashKey: true, required: true },
          sortKey: { type: "string", isRangeKey: true, required: true },
        },
      });
      expect(table).toBeInstanceOf(DdbSingleTable);
    });

    test(`throws "SchemaValidationError" when called with an invalid tableKeysSchema arg`, () => {
      expect(() => {
        new DdbSingleTable({
          tableName: "TestTable",
          tableKeysSchema: {
            partitionKey: { type: "string" }, // missing `isHashKey` and `required`
            sortKey: { type: "string" }, //      missing `isSortKey` and `required`
          } as any,
        });
      }).toThrowError(SchemaValidationError);
    });

    test(`throws "DdbSingleTableError" when called with an invalid tableConfigs arg`, () => {
      expect(() => {
        new DdbSingleTable({
          tableName: "TestTable",
          tableKeysSchema: {
            partitionKey: { type: "string", isHashKey: true, required: true },
            sortKey: { type: "string", isRangeKey: true, required: true },
          },
          tableConfigs: {
            billingMode: "PAY_PER_REQUEST",
            // "provisionedThroughput" should not be provided when "billingMode" is "PAY_PER_REQUEST"
            provisionedThroughput: {
              readCapacityUnits: 1,
              writeCapacityUnits: 1,
            },
          } as any,
        });
      }).toThrowError(DdbSingleTableError);
    });
  });

  describe("table.getModelSchema()", () => {
    test("throws an error when called with an invalid modelSchema arg", () => {
      const table = new DdbSingleTable({
        tableName: "TestTable",
        tableKeysSchema: {
          partitionKey: { type: "string", isHashKey: true, required: true },
          sortKey: { type: "string", isRangeKey: true, required: true },
        },
      });
      expect(() => {
        table.getModelSchema({
          fooAttributeName: {
            type: "string",
            nonExistentAttrConfig: "", // <-- should cause an error
          },
        } as const);
      }).toThrow(/nonExistentAttrConfig/);
    });
  });

  describe("table.createModel()", () => {
    test("returns a new Model instance when called with valid args", () => {
      const table = new DdbSingleTable({
        tableName: "myTable",
        tableKeysSchema: {
          partitionKey: { type: "string", isHashKey: true, required: true },
          sortKey: { type: "string", isRangeKey: true, required: true },
        },
      });
      const model = table.createModel("TestModel", { attributeA: { type: "string" } });
      expect(model).toBeInstanceOf(Model);
    });
  });
});
