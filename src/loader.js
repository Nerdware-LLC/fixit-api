import { pathToFileURL } from "url";
import { resolve as resolveTS } from "ts-node/esm";
import * as tsConfigPaths from "tsconfig-paths";

// This loader allows tsconfig-paths to work with ESM

const { absoluteBaseUrl, paths } = tsConfigPaths.loadConfig();
const matchPath = tsConfigPaths.createMatchPath(absoluteBaseUrl, paths);

export function resolve(specifier, ctx, defaultResolve) {
  const match = matchPath(specifier);
  /* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
  return match
    ? resolveTS(pathToFileURL(match).href, ctx, defaultResolve)
    : resolveTS(specifier, ctx, defaultResolve);
}

export { load, transformSource } from "ts-node/esm";
