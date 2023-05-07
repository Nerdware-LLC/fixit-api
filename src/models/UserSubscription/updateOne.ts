import moment from "moment";
import { InternalServerError } from "@utils/customErrors";
import { UserSubscription } from "./UserSubscription";
import type { Model } from "@lib/dynamoDB";
import type { UserType, UserSubscriptionType } from "@types";
import type { Simplify } from "type-fest";

export const updateOne = async function (
  this: InstanceType<typeof Model>,
  {
    userID,
    sk,
    createdAt,
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

type MutableSubscriptionFields = Simplify<
  Pick<UserSubscriptionType, "id" | "currentPeriodEnd" | "productID" | "priceID" | "status">
>;
