import { usersCache } from "@/lib/cache";
import { ddbTable } from "@/models/ddbTable";
import { logger } from "@/utils/logger";
import type { Profile } from "@/types";

logger.server(`initCacheForUsersSearch: initializing cache ...`);

const { Items: items } = await ddbTable.ddbClient.scan({
  TableName: ddbTable.tableName,
  ProjectionExpression: "pk, sk, #data, handle, phone, profile",
  FilterExpression: "begins_with(pk, :user_pk_prefix)",
  ExpressionAttributeNames: {
    "#data": "data",
  },
  ExpressionAttributeValues: {
    ":user_pk_prefix": "USER#",
  },
});

if (Array.isArray(items) && items.length > 0) {
  items.forEach((item) => {
    const {
      pk: id,
      data: email,
      handle,
      phone,
      profile,
      createdAt,
      updatedAt,
    } = item as {
      pk: string;
      data: string;
      handle: string;
      phone: string;
      profile: Profile;
      createdAt: Date;
      updatedAt: Date;
    };

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
}

logger.server(`initCacheForUsersSearch: cache init complete`);
