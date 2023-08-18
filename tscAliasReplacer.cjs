/**
 * The tsc-alias default replacer currently mistakes the "events" and "graphql"
 * 3rd party node_modules for the "events" and "graphql" folders in the project
 * directory. So explicit overwrites are needed for these cases - the rest can
 * remain the same.
 *
 * @see https://github.com/justkey007/tsc-alias/discussions/73
 * @docs https://www.npmjs.com/package/tsc-alias
 */

exports.default = (
  /** @type { import("tsc-alias").AliasReplacerArguments  } */
  { orig, file, config }
) => {
  // If the tsc-alias path ends with "/events", replace it with "events" (node_modules)
  if (/\/events"$/.test(orig)) return `from "events"`;

  // If the tsc-alias path ends with "/graphql", replace it with "graphql" (node_modules)
  if (/\/graphql"$/.test(orig)) return `from "graphql"`;

  // Else return the original path set by tsc-alias
  return orig;
};
