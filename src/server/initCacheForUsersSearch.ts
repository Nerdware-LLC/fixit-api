import { usersCache } from "@lib/cache";
import { ddbSingleTable } from "@lib/dynamoDB";
import { logger } from "@utils/logger";

logger.server(`initCacheForUsersSearch: initializing cache ...`);

const dbUserItems = await ddbSingleTable.ddbClient.scan({
  ProjectionExpression: "pk, sk, #data, handle, phone, profile",
  FilterExpression: "begins_with(pk, :user_pk_prefix)",
  ExpressionAttributeNames: {
    "#data": "data",
  },
  ExpressionAttributeValues: {
    ":user_pk_prefix": "USER#",
  },
});

dbUserItems.forEach((item) => {
  const { pk: id, data: email, handle, phone, profile, createdAt, updatedAt } = item;

  if (id && email && handle && phone && profile && createdAt && updatedAt) {
    // Only users' public fields are cached for search
    usersCache.set(handle, {
      id,
      email,
      handle,
      phone,
      profile,
      createdAt,
      updatedAt,
    });
  }
});

logger.server(`initCacheForUsersSearch: cache init complete`);
