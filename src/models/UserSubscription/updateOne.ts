import moment from "moment";
import type { Model } from "@lib/dynamoDB";
import type { UserType } from "@models/User/types";
import { InternalServerError } from "@utils/customErrors";
import { UserSubscription } from "./UserSubscription";
import type { UserSubscriptionType } from "./types";

export const updateOne = async function (
  this: InstanceType<typeof Model>,
  {
    userID,
    sk,
    createdAt
  }: {
    userID: UserType["id"];
    sk?: UserSubscriptionType["sk"];
    createdAt?: UserSubscriptionType["createdAt"];
  },
  mutableSubscriptionFields: MutableSubscriptionFields
) {
  if (!sk && !createdAt) throw new InternalServerError();
  else if (!sk) sk = `SUBSCRIPTION#${userID}#${moment(createdAt).unix()}`;

  return await UserSubscription.updateItem({ userID, sk }, mutableSubscriptionFields);
};

type MutableSubscriptionFields = Expand<
  Pick<UserSubscriptionType, "id" | "currentPeriodEnd" | "productID" | "priceID" | "status">
>;
