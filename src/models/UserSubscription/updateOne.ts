import { InternalServerError } from "@utils/httpErrors";
import { UserSubscription, type UserSubscriptionModelItem } from "./UserSubscription";
import type { UserModelItem } from "@models/User";

export const updateOne = async function (
  this: typeof UserSubscription,
  {
    userID,
    sk,
    createdAt,
  }: {
    userID: UserModelItem["id"];
    sk?: UserSubscriptionModelItem["sk"];
    createdAt?: UserSubscriptionModelItem["createdAt"];
  },
  mutableSubscriptionFields: Pick<
    UserSubscriptionModelItem,
    "id" | "currentPeriodEnd" | "productID" | "priceID" | "status"
  >
) {
  if (!sk) {
    if (!createdAt) throw new InternalServerError();
    sk = UserSubscription.getFormattedSK(userID, createdAt);
  }

  return await UserSubscription.updateItem({ userID, sk }, mutableSubscriptionFields);
};
