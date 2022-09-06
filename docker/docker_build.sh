#!/bin/bash

log_error_exit() {
    printf "\n\e[1;31m[ERROR] %s (EXIT 1).\e[0m\n" "$1" ; exit 1
}

DOCKER_DIR="$( dirname "$( realpath "${BASH_SOURCE[0]}" )" )"
REPO_ROOT="$( dirname "${DOCKER_DIR:?}" )"

# ENSURE PWD IS SET TO THE DESIRED WORK DIR.
if [ "$PWD" != "$REPO_ROOT" ]; then
    cd "$REPO_ROOT" || log_error_exit "Failed to cd into desired working directory: \"$REPO_ROOT\""
fi

declare -A BUILD_STAGE_TAGS
BUILD_STAGE_TAGS=(
	[base]="base v1.0.0"
	[dev]="dev v1.0.0"
	[builder]="builder v1.0.0"
	[prod]="prod v1.0.0"
)

docker_build_fixit_api() {
	local target="${1-prod}"
	local tags=(${BUILD_STAGE_TAGS[$target]})

	echo "[docker_build.sh] Building nerdware/fixit-api   target: ${target}"

	docker build -f docker/Dockerfile --target "${target}" "${tags[@]/#/-t nerdware/fixit-api:}" ${REPO_ROOT}
}

docker_build_fixit_api dev
docker_build_fixit_api prod
