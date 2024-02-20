import { EnvObject } from "./EnvObject";

// eslint-disable-next-line node/no-process-env
export const ENV = new EnvObject(process.env);
