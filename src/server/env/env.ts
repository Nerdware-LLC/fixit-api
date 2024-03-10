import { createEnvObject } from "./helpers.js";

// eslint-disable-next-line node/no-process-env
export const ENV = createEnvObject(process.env);
