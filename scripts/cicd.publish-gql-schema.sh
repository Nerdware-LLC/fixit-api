#!/usr/bin/env bash
###############################################################################
readonly script_name='Publish Fixit GraphQL Schema Changes'

# Script constants:
readonly typedefs_src='src/graphql/typeDefs.ts'
readonly graph_name='fixit'
readonly default_variant='current'

readonly script_help="
SCRIPT:	$script_name

	This script updates the $graph_name GraphQL schema in Apollo Studio using the
	provided '--variant' (default: '$default_variant').

	An up-to-date schema is generated using type-defs located in the project's
	source code (see '$typedefs_src'). The schema is then validated
	and published using Apollo's Rover CLI.

USAGE:  cicd.publish-gql-schema.sh [OPTIONS]

OPTIONS:
	--variant=  	The graph variant to use when validating the schema. Must be
                	one of 'prod', 'staging', or 'current' (default: '$default_variant').

	--dry-run    	Only generate the local schema file, but do not publish it.

	--debug	     	Prevent removal of temporary files on exit (default: false).

	-s, --silent	Disable script stdout log output (default: false).

	-h, --help   	Display this help message.
"
###############################################################################
# UTIL FUNCTIONS

# log_info: print args to stdout unless the --silent flag was provided
function log_info() {
	# ANSI codes: \e[96m is light-cyan text, \e[0m is reset
	[ "$silent" != 'true' ] && printf '\e[96m%b\e[0m\n' "${@}"
}

# throw_error: log error-message args and exit (regardless of --silent flag)
function throw_error() {
	# ANSI codes: \e[31m is red text, \e[0m is reset
	printf '\e[31m%b\e[0m\n' "🚨 ERROR: $1" "${@:2}" '(EXIT 1)'
	exit 1
}

###############################################################################
# PARSE SCRIPT ARGS/OPTIONS

# If a 'help' flag was provided, log the help message and exit
[[ "${*}" =~ (-h|help) ]] && echo "$script_help" && exit 0

readonly silent="$([[ "${*}" =~ (-s|--silent) ]] && echo true || echo false)"
readonly debug="$([[ "${*}" == *--debug* ]] && echo true || echo false)"
readonly dry_run="$([[ "${*}" == *--dry-run* ]] && echo true || echo false)"

# Parse --variant to determine the graph variant to use
readonly variant_arg="$(grep -oPm1 '(?<=--variant(=|\s))\S+' <<<"$*")"

# If --variant was provided, ensure it's a valid value
[[ -n "$variant_arg" && ! "$variant_arg" =~ ^(prod|staging|current)$ ]] &&
	throw_error "Invalid variant specified. Must be one of 'prod', 'staging', or 'current'."

# Assign variant to the provided value or the default
readonly variant="${variant_arg:-$default_variant}"
readonly graph_ref="$graph_name@$variant"

###############################################################################
# SCRIPT ACTION FUNCTIONS

function ensure_npx_cmd_is_present() {
	if ! type npx 1>/dev/null; then
		# Try invoking `nvm` to make it available
		type nvm 1>/dev/null && nvm use 1>/dev/null
		# If `npx` is still not available, throw an error
		! type npx && throw_error 'Unable to fetch the GraphQL schema — npx command not found.'
	fi
}

function setup_tmp_dir() {
	# Global vars:
	readonly tmp_dir="$(basename "$(
		mktemp --tmpdir="$PWD" -d 'tmp.gql-codegen-script.XXX' ||
			throw_error 'Failed to create temporary directory.'
	)")"

	# TRAP: on EXIT, remove the tmp dir unless --debug flag is present
	function rm_tmp_unless_debug() {
		if [ "$debug" == 'true' ]; then
			log_info "[DEBUG MODE]: Not removing temporary directory: '$tmp_dir'"
		else
			rm -rf "$tmp_dir"
		fi
	}

	trap rm_tmp_unless_debug EXIT
}

function generate_local_gql_schema_file() {
	log_info 'Generating GraphQL schema file ...'

	# Global vars:
	readonly tsc_outdir="$tmp_dir/tsc-outdir"
	readonly schema_file="$tmp_dir/schema.graphql"

	# Now to make the GQL schema, the TS files must first be converted to JS:
	npx tsc \
		--outDir "$tsc_outdir" \
		--target ESNext \
		--module ESNext \
		--moduleResolution Node \
		$typedefs_src

	# Now make the GQL schema from the generated JS files:
	node --input-type=module -e "
	import fs from 'node:fs';
	import { mergeTypeDefs } from '@graphql-tools/merge';
	import { print } from 'graphql';
	import { typeDefs } from './$tsc_outdir/typeDefs.js';

	// The type-defs are exported as an array of GraphQL AST nodes
	const typeDefsMerged = mergeTypeDefs(typeDefs);

	let sdlString = print(typeDefsMerged);

	/******************************* SDL Formatting *******************************
	*  Before writing the SDL to disk, the string is formatted as follows:
	*
	*  1. Single-double-quote docstring boundaries are converted to triple-double-quotes.
	*  2. Single-line docstrings longer than 70 characters are line-wrapped.
	*  3. Docstrings which are immediately preceded by a field definition on the line
	*     above are prefixed by a newline to ensure an empty line exists between the two.
	*  4. The root 'schema' block is removed.
	*
	*  Why do this? To ensure the SDL is formatted in the same manner as if it were
	*  fetched/downloaded from Apollo Studio, thereby ensuring consistency and making
	*  it easier to compare/diff the schema from one version to the next.
	*/

	// Regex op 1: convert all double-quote docstring boundaries to triple-double-quotes.
	//   ^            Asserts position at the start of a line.
	//   (\u0020*?)   The first group captures any leading space chars before a docstring.
	//   \"           Matches exactly one double quote character.
	//   ([^\"\n]+?)  The second group captures the text between the double-quotes.
	//   \"           Matches exactly one double quote character.
	//   $            Asserts position at the end of a line.
	sdlString = sdlString.replaceAll(/^(\u0020*?)\"([^\"\n]+?)\"$/gm, '\$1\"\"\"\$2\"\"\"');

	// Regex op 2: line-wrap single-line docstrings longer than 70 characters.
	//   ^                Asserts position at the start of a line.
	//   (\u0020*?)       The first group captures any leading whitespace before a docstring.
	//   \"\"\"           Matches exactly three double quote characters.
	//   ([^\"\n]{70,}?)  The second group captures a single line of text that's 70+ chars long.
	//   \"\"\"           Matches exactly three double quote characters.
	//   $                Asserts position at the end of a line.
	sdlString = sdlString.replaceAll(/^(\u0020*?)\"\"\"([^\"\n]{70,}?)\"\"\"$/gm, '\$1\"\"\"\n\$1\$2\n\$1\"\"\"');

	// Regex op 3: ensure exactly 1 empty line exists between docstrings and preceding field defs.
	//   (?<=:\u0020[a-zA-Z0-9=!\[\]\u0020]+?\n)  Positive lookbehind for a field definition (e.g. 'field: [Type!]').
	//   (^\u0020*?\"\"\"[^\"]+)                  Captures a docstring.
	sdlString = sdlString.replaceAll(/(?<=:\u0020[a-zA-Z0-9=!\[\]\u0020]+?\n)(^\u0020*?\"\"\"[^\"]+)/gm, '\n\$1');

	// Regex op 4: remove the root 'schema' block
	//   \n^schema\u0020{[^]*   Matches the 'schema' block and everything after it.
	sdlString = sdlString.replace(/\n^schema\u0020{[^]*/m, '');

	fs.writeFileSync('$schema_file', sdlString);"

	# Throw error if the schema file was not generated
	[[ $? != 0 || ! -f "$schema_file" ]] && throw_error 'Failed to generate local GraphQL schema file.'

	log_info 'Local GraphQL schema file generated successfully! 🚀'
}

function validate_local_gql_schema() {
	log_info "Validating the GraphQL schema for graph '$graph_ref' ..."

	npx rover graph check "$graph_ref" --schema "$schema_file" 1>/dev/null ||
		throw_error 'GraphQL schema validation failed.'
}

function publish_schema_unless_dry_run() {
	if [ "$dry_run" != 'true' ]; then
		log_info "Publishing the GraphQL schema for graph '$graph_ref' to Apollo Studio ..."

		npx rover graph publish "$graph_ref" --schema "$schema_file"
	else
		log_info 'Dry-run mode enabled. Skipping schema publication.'
	fi
}

###############################################################################
# SCRIPT EXECUTION

log_info "[Script] $script_name"

ensure_npx_cmd_is_present
setup_tmp_dir
generate_local_gql_schema_file
validate_local_gql_schema
publish_schema_unless_dry_run

###############################################################################
