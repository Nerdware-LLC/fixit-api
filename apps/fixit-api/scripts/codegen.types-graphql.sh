#!/usr/bin/env bash
###############################################################################
readonly script_name='Fixit GraphQL Types Codegen'
readonly script_filename="$(basename "${BASH_SOURCE[0]}")"

# Script constants:
readonly schema_files='src/graphql/**/typeDefs.ts'
readonly types_output='src/types/__codegen__/graphql.ts'

readonly script_help="
SCRIPT:	$script_name

	This script creates TypeScript types from the Fixit GraphQL schema.

	Schema Input:  $schema_files
	Types Output:  $types_output

USAGE:  scripts/$script_filename [OPTIONS]

OPTIONS:
	-h, --help     Display this help message and exit.
"
###############################################################################
# PARSE SCRIPT ARGS/OPTIONS

# If a 'help' flag was provided, log the help message and exit
[[ "${*}" =~ (-h|help) ]] && echo "$script_help" && exit 0

###############################################################################
# UTIL FUNCTIONS

# log_info: print args to stdout (ANSI: \e[96m is light-cyan text, \e[0m is reset)
function log_info() { printf '\e[96m%b\e[0m\n' "${@}"; }

# throw_error: print err-msg args to stdout+stderr and exit (ANSI: \e[31m is red text)
function throw_error() {
	printf >&2 '\e[31m%b\e[0m\n' "🚨 ERROR: $1" "${@:2}" '(EXIT 1)'
	exit 1
}

###############################################################################
# SCRIPT ACTION FUNCTIONS

function ensure_npx_cmd_is_present() {
	if ! type npx 1>/dev/null; then
		# Try invoking `nvm` to make it available
		type nvm 1>/dev/null && nvm use 1>/dev/null
		# If `npx` is still not available, throw an error
		! type npx && throw_error \
			'Unable to proceed with script execution — npx command not found.'
	fi
}

function generate_graphql_ts_types() {
	log_info 'Generating GraphQL types ...'

	NODE_OPTIONS='-r ts-node/register --loader ./loader.js --no-warnings' \
		npx graphql-codegen-esm --config codegen.ts

	# Log the result of the OpenAPI codegen operation
	if [ $? != 0 ]; then
		throw_error 'Failed to generate GraphQL TypeScript types.'
	else
		log_info 'GraphQL TypeScript types generated successfully! 🚀'
	fi
}

###############################################################################
# SCRIPT EXECUTION

log_info "[Starting Script: $script_name]\n"

ensure_npx_cmd_is_present
generate_graphql_ts_types

###############################################################################
