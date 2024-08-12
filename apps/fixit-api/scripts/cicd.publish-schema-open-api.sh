#!/usr/bin/env bash
###############################################################################
readonly script_name='Publish Fixit OpenAPI Schema Changes'
readonly script_filename="$(basename "${BASH_SOURCE[0]}")"

# Script constants:
readonly schema_file='schemas/OpenAPI/open-api.yaml'

readonly script_help="
SCRIPT:	$script_name

	This script updates the Fixit OpenAPI schema in SwaggerHub.

	Schema Input:  $schema_file

USAGE:  scripts/$script_filename [OPTIONS]

OPTIONS:
	--version=     The schema version to use for publishing the schema (required).
	--update       Update the schema if the version already exists.
	--setdefault   Publish the schema as the new default version (default: false).
	               Use this flag when publishing from a production release.
	--dry-run      Run the script, but do not publish the schema to SwaggerHub.
	--debug	       Prevent removal of temporary files on exit (default: false).
	-h, --help     Display this help message and exit.
"
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
# PARSE SCRIPT ARGS/OPTIONS

# If a 'help' flag was provided, log the help message and exit
[[ "${*}" =~ (-h|help) ]] && echo "$script_help" && exit 0

readonly debug="$([[ "${*}" == *--debug* ]] && echo true || echo false)"

readonly dry_run="$([[ "${*}" == *--dry-run* ]] && echo true || echo false)"

readonly set_default="$([[ "${*}" == *--setdefault* ]] && echo true || echo false)"

readonly update_if_exists="$([[ "${*}" == *--update* ]] && echo true || echo false)"

readonly version_arg="$(grep -oPm1 '(?<=--version(=|\s))\S+' <<<"$*")"

###############################################################################
# SCRIPT ACTION FUNCTIONS

function ensure_version_arg_is_valid() {
	[ -z "$version_arg" ] &&
		throw_error "Invalid --version value. Must be a valid git ref."

	# If version is valid, set global var 'version'
	readonly version="$version_arg"
}

function ensure_npx_cmd_is_present() {
	if ! type npx 1>/dev/null; then
		# Try invoking `nvm` to make it available
		type nvm 1>/dev/null && nvm use 1>/dev/null
		# If `npx` is still not available, throw an error
		! type npx &&
			throw_error 'Unable to proceed with script execution — npx command not found.'
	fi
}

function validate_openapi_schema() {
	log_info 'Validating the OpenAPI schema ...'

	! npx redocly lint "$schema_file" 1>/dev/null &&
		throw_error 'The OpenAPI schema is invalid.'
}

function setup_tmp_dir() {
	# Global vars:
	readonly tmp_dir="$(basename "$(
		mktemp --tmpdir="$PWD" -d "tmp.${script_filename%.sh}.XXX" ||
			throw_error 'Failed to create temporary directory.'
	)")"

	# TRAP: on EXIT, remove the tmp dir unless --debug flag is present
	function rm_tmp_unless_debug() {
		if [ "$debug" == 'true' ]; then
			log_info "[DEBUG MODE]: Not removing temporary directory \e[0m$tmp_dir"
		else
			rm -rf "$tmp_dir"
		fi
	}

	trap rm_tmp_unless_debug EXIT
}

function create_bundled_schema_file() {
	log_info 'Bundling the schema for publication ...'

	# Global vars:
	readonly tmp_bundled_schema_file="$tmp_dir/open-api-bundled.yaml"

	npx redocly bundle $schema_file --output "$tmp_bundled_schema_file" 1>/dev/null

	# Throw error if the bundled-schema-file was not generated
	[[ $? != 0 || ! -f "$tmp_bundled_schema_file" ]] &&
		throw_error 'Failed to create schema bundle for publication.'
}

function publish_schema_unless_dry_run() {
	# First, check if dry-run mode is enabled
	if [ "$dry_run" == 'true' ]; then
		log_info 'Dry-run mode enabled. Skipping schema publication.'
		return 0
	fi

	log_info "Publishing the OpenAPI schema to SwaggerHub ..."

	# SwaggerHub CLI args:
	local schema_ref="Nerdware/Fixit/$version"
	local swaggerhub_cli_args=(
		"$schema_ref"
		"--file=$tmp_bundled_schema_file"
		'--visibility=public'
	)

	# SwaggerHub CLI args for updating the default version:
	[ "$set_default" == 'true' ] && swaggerhub_cli_args+=(
		'--setdefault'
		'--published=publish'
	)

	# Try to create a new schema version, capture stdout+stderr
	local output="$(npx swaggerhub api:create "${swaggerhub_cli_args[@]}" 2>&1)"

	# If the 'api:create' operation succeeded, log success msg and end script
	if [[ "$output" != *Error* ]]; then
		log_info "New schema version '$version' published successfully! 🚀"
		return 0
	fi

	# If it failed bc of anything other than "the version already exists", throw error
	[[ "$output" != *"API version '$schema_ref' already exists"* ]] &&
		throw_error 'Failed to publish the schema to SwaggerHub.' "$output"

	# If the version already exists, but "update-mode" is not enabled, throw error
	[ "$update_if_exists" != 'true' ] && throw_error \
		"Schema version '$version' already exists, but the --update flag was not provided." \
		'Use the --update flag to update an existing version.'

	log_info "Schema version '$version' already exists." \
		'Attempting to update the existing version ...'

	# Try again using 'api:update' instead of 'api:create'
	npx swaggerhub api:update "${swaggerhub_cli_args[@]}"
}

###############################################################################
# SCRIPT EXECUTION

log_info "\n[Starting Script: $script_name]\n"

ensure_version_arg_is_valid
ensure_npx_cmd_is_present
validate_openapi_schema
setup_tmp_dir
create_bundled_schema_file
publish_schema_unless_dry_run

###############################################################################
