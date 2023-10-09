import { mockClient } from "aws-sdk-client-mock";

const {
  DynamoDBDocumentClient: Actual_DynamoDBDocumentClient,
  GetCommand,
  BatchGetCommand,
  PutCommand,
  BatchWriteCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} = await vi.importActual<typeof import("@aws-sdk/lib-dynamodb")>("@aws-sdk/lib-dynamodb");

const DynamoDBDocumentClient = {
  from: vi.fn(() => mockClient(Actual_DynamoDBDocumentClient)),
};

export {
  DynamoDBDocumentClient,
  GetCommand,
  BatchGetCommand,
  PutCommand,
  BatchWriteCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
};
