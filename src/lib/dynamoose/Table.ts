import dynamoose from "dynamoose";
import { ENV } from "@server/env";
import {
  User,
  UserSubscription,
  UserStripeConnectAccount,
  Contact,
  WorkOrder,
  Invoice
} from "@models";

export const Table = new dynamoose.Table(
  ENV.AWS.DYNAMODB_TABLE_NAME,
  [User, UserSubscription, UserStripeConnectAccount, Contact, WorkOrder, Invoice],
  {
    initialize: false, // Table will be initialized in dynamoose.ts if ENV != production (init: create, waitForActive, update)
    create: true,
    waitForActive: {
      enabled: !ENV.IS_PROD, // true, unless env is production
      check: {
        timeout: 30000, // timeout after 30 seconds
        frequency: 1000 // check once per second til active
      }
    },
    update: true,
    throughput: 25
  }
);
