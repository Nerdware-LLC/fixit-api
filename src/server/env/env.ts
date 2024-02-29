import { EnvObject } from "./EnvObject.js";

// eslint-disable-next-line node/no-process-env
export const ENV = new EnvObject(process.env);
