import { vi } from "vitest";

// Mock modules commonly used in many tests:

vi.mock("@aws-sdk/client-dynamodb");
vi.mock("@aws-sdk/client-lambda");
vi.mock("@aws-sdk/lib-dynamodb");
vi.mock("@server/env");
