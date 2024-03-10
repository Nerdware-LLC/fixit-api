#!/usr/bin/env bash
####################################################################################
# This script validates the OpenAPI Schema and uses it to generate types.
#
# SCRIPT FLAGS:
#
# --update-swaggerhub: Update the schema in SwaggerHub.
# 		PRE-REQUISITES:
# 			1. The SWAGGERHUB_API_KEY environment variable must be available.
# 			2. The "version" in package.json must not reflect a pre-release version.
#
# --create-new-version: Create a new version of the schema in SwaggerHub.
# 		PRE-REQUISITES:
# 			1. The '--update-swaggerhub' flag must be present.
# 			2. The SWAGGERHUB_API_KEY environment variable must be available.
# 			3. The "version" in package.json must not reflect a pre-release version.
####################################################################################

# Util function to "throw" an error and exit
throw_error() { echo "ERROR: $1 (EXIT 1)"; exit 1; };

# Ensure the root OAS schema and package.json are present
[ ! -f docs/open-api.yaml ] && throw_error "OpenAPI Schema not found"
[ ! -f package.json ] && throw_error "package.json not found"

# Ensure the `npx` command is available
if ! type npx 1>/dev/null; then
	# Try invoking `nvm` to make it available
	type nvm 1>/dev/null && nvm use 1>/dev/null
	# If `npx` is still not available, throw an error
	! type npx && throw_error "npx command not found"
fi

# Ensure the OAS schema is valid
! npx swagger-cli validate docs/open-api.yaml && \
	throw_error "OpenAPI Schema validation failed"

# Read the project "version" from package.json
project_version="$( jq '.version' ./package.json )"

# Ascertain whether SwaggerHub should be updated:
if [[ -n "$SWAGGERHUB_API_KEY" && \
	"$project_version" != *-* && \
	"${*}" == *--update-swaggerhub* ]]; then
	update_swaggerhub=true
else
	update_swaggerhub=false
fi

# Update the schema in SwaggerHub if all conditions are met
if [ $update_swaggerhub == true ]; then

	# If running within a CI env, this script creates a new schema version
	if [[ "${*}" == *--create-new-version* ]]; then
		create_new_version=true
	else
		create_new_version=false
	fi

	# If running within a CI env, configure behavior to Ascertain whether a new schema version should be created

	# If create_new_version, first ensure the schema version = project version
	if [ $create_new_version == true ]; then
		sed -i \
			"s/version: .*/version: $project_version/" \
			docs/open-api.yaml
	fi

	# Create a bundled schema file for SwaggerHub
	npx swagger-cli bundle docs/open-api.yaml \
		--outfile docs/open-api.bundled.yaml \
		--type yaml

	# Ensure the bundled schema file was created successfully
	[ ! -f docs/open-api.bundled.yaml ] && \
		throw_error "Failed to create bundled schema file"

	# Set the SwaggerHub CLI flags (common to both UPDATE and CREATE ops)
	swaggerhub_cli_shared_flags=(
		--file=docs/open-api.bundled.yaml
		--visibility=public
		--setdefault
	)

	# Ascertain whether the SwaggerHub op should be UPDATE or CREATE:
	if [ $create_new_version == true ]; then
		# Create a new schema version
		npx swaggerhub api:create Nerdware/Fixit "${swaggerhub_cli_shared_flags[@]}"
	else
		# Update an existing schema version
		npx swaggerhub api:update Nerdware/Fixit "${swaggerhub_cli_shared_flags[@]}"
	fi

	# Cleanup - remove the bundled schema file
	rm docs/open-api.bundled.yaml
fi

# Update OpenAPI types using NodeJS API from openapi-typescript to fix `Date` types.
# (Their CLI does not convert `format: date-time` values to `Date` types)

node --input-type=module -e "
import fs from 'node:fs';
import ts from 'typescript';
import openapiTS, { astToString } from 'openapi-typescript';

const DATE = ts.factory.createIdentifier('Date');
const NULL = ts.factory.createLiteralTypeNode(ts.factory.createNull());

const ast = await openapiTS(
	new URL('file://$PWD/docs/open-api.yaml'),
	{
		transform(schemaObject, metadata) {
			if (schemaObject.format === 'date-time') {
				return Array.isArray(schemaObject.type) && schemaObject.type.includes('null')
					? ts.factory.createUnionTypeNode([DATE, NULL])
					: DATE;
			}
		},
	}
);

const tsFileContents = \`\
/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

\${astToString(ast)}
\`;

fs.writeFileSync('src/types/__codegen__/open-api.ts', tsFileContents);"

###############################################################################