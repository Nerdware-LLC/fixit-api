#!/usr/bin/env bash
###############################################################################
readonly script_name='Fixit OpenAPI Types Codegen'
readonly script_filename="$(basename "${BASH_SOURCE[0]}")"

# Script constants:
readonly schema_file='schemas/OpenAPI/open-api.yaml'
readonly types_output='src/types/__codegen__/open-api.ts'

readonly script_help="
SCRIPT:	$script_name

	This script creates TypeScript types from the Fixit OpenAPI schema file.

	Schema Input:  $schema_file
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

function validate_openapi_schema() {
	log_info 'Validating the OpenAPI schema ...'

	! npx redocly lint "$schema_file" 1>/dev/null &&
		throw_error 'The OpenAPI schema is invalid.'

	log_info 'The OpenAPI schema is valid! 🎉\n'
}

function generate_openapi_ts_types() {
	log_info 'Generating OpenAPI TypeScript types ...'

	local schema_file_version="$(grep -oPm1 '(?<=version:\s)[a-zA-Z0-9.-]+' "$schema_file")"

	# Update OpenAPI types using NodeJS API from openapi-typescript to fix `Date` types.
	# (Their CLI does not convert `format: date-time` values to `Date` types)

	node --input-type=module -e "
		import fs from 'node:fs';
		import ts from 'typescript';
		import openapiTS, { astToString } from 'openapi-typescript';

		const DATE = ts.factory.createTypeReferenceNode('Date');
		const NULL = ts.factory.createLiteralTypeNode(ts.factory.createNull());
		const UNION_DATE_NULL = ts.factory.createUnionTypeNode([DATE, NULL]);

		const ast = await openapiTS(
		  new URL('file://$PWD/$schema_file'),
		  {
		    transform(schemaObject, metadata) {
		      if (schemaObject.format === 'date-time') {
		        return Array.isArray(schemaObject.type) && schemaObject.type.includes('null')
		          ? UNION_DATE_NULL
		          : DATE;
		      }
		    }
		  },
		);

		const tsFileContents = \`\
		/**
		 * Fixit OpenAPI Schema Types
		 *
		 * DO NOT MAKE DIRECT CHANGES TO THIS FILE.
		 *
		 * This file was auto-generated using schema version: \\\`$schema_file_version\\\`
		 */

		\${astToString(ast)}
		\`.replaceAll(/^\t{0,2}/gm, ''); // <-- Removes leading tabs

		fs.writeFileSync('$types_output', tsFileContents);"

	# Log the result of the OpenAPI codegen operation
	if [ $? != 0 ]; then
		throw_error 'Failed to generate OpenAPI TypeScript types.'
	else
		log_info 'OpenAPI TypeScript types generated successfully! 🚀'
	fi
}

###############################################################################
# SCRIPT EXECUTION

log_info "\n[Starting Script: $script_name]\n"

ensure_npx_cmd_is_present
validate_openapi_schema
generate_openapi_ts_types

###############################################################################
