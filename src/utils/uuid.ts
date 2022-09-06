import { v1 as uuidv1 } from "uuid";

export const getUnixTimestampUUID = uuidv1({ msecs: new Date().getTime() });
