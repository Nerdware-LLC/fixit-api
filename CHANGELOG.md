# Changelog

All notable changes to this project will be documented in this file.

---


# [1.3.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.2.0...v1.3.0) (2022-09-26)


### Bug Fixes

* **jest:** update jest config to work with TS and ESM ([c8628dd](https://github.com/Nerdware-LLC/fixit-api/commit/c8628dd898f88deb812e24a34669081927512b0a))
* **Model:** update import path to dynamoose package (no local) ([290efe9](https://github.com/Nerdware-LLC/fixit-api/commit/290efe9d3208de7bd01146695c5bfc725296a4b7))
* **path-alias:** uncomment module-alias/register for running build ([c4714a8](https://github.com/Nerdware-LLC/fixit-api/commit/c4714a809c787cd12d3b0324163cce29be507335))
* **util/uuid:** update export type to fn not value ([85b4c07](https://github.com/Nerdware-LLC/fixit-api/commit/85b4c071a7689e05e49822b4bd8d39370ecbfbeb))
* **uuid:** correct UUIDv1 regex pattern string util ([ec031a6](https://github.com/Nerdware-LLC/fixit-api/commit/ec031a61b65f34775e8c1ed6cda2c8b72a4246f4))
* **webhooksRouter:** add getTypeSafeErr to wh-mw catch block ([b5a1d3a](https://github.com/Nerdware-LLC/fixit-api/commit/b5a1d3abbba6ca4c5991ad97aa62e4309def6e8c))


### Features

* **Docker:** ch rm-test-files cmds to silence find output, +ignore test files ([2791b26](https://github.com/Nerdware-LLC/fixit-api/commit/2791b26c135cef06f388f47332db45eefb1d37e6))
* **Dockerfile:** rm hard-coded LABELS ([0a6ad09](https://github.com/Nerdware-LLC/fixit-api/commit/0a6ad09475bbbef63f962ad1a7272172b1650a35))
* **env:** add local stripe-wh-secrets for dev/test envs ([ed8cbfb](https://github.com/Nerdware-LLC/fixit-api/commit/ed8cbfbcc6cca894cf37e5862441003ecd060a7f))
* **Errors:** add CustomHttpError abstract class ([5130055](https://github.com/Nerdware-LLC/fixit-api/commit/513005505658cd23ae9cacc7f874489be539c072))
* **logger:** add 'test' namespace to logger util ([f70ddcc](https://github.com/Nerdware-LLC/fixit-api/commit/f70ddccf947b2d39f1b6832b74fb38063324aa9a))
* **nodemon:** add 2.5 sec delay to nodemon config ([6a6afa6](https://github.com/Nerdware-LLC/fixit-api/commit/6a6afa686490a8aa14b29b6343b071c699e9c43c))
* **PushNotification:** add PN base class ([e785334](https://github.com/Nerdware-LLC/fixit-api/commit/e785334be1fae377859f431a572f100b90e9a15a))
* **Sentry:** add sentry tracing and err-capture in proc-error handlers ([e7063e0](https://github.com/Nerdware-LLC/fixit-api/commit/e7063e0094ee34cfa2b244040925f46d8bcad11c))
* **types:** add various ambient type defs for global usage ([75c7ba8](https://github.com/Nerdware-LLC/fixit-api/commit/75c7ba82f59e6f311c41c4593b95bbbd5b6be678))

# [1.2.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.1.0...v1.2.0) (2022-09-06)


### Features

* init commit Dockerfile, compose file, build script ([d7ec947](https://github.com/Nerdware-LLC/fixit-api/commit/d7ec947336eb8e074a99c476aef6ff6ec7686583))
* init commit src files ([8c2a3fa](https://github.com/Nerdware-LLC/fixit-api/commit/8c2a3faeaf02943f74d9cfc637eae91eb25d5e81))

# [1.1.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.0.0...v1.1.0) (2022-09-06)


### Features

* init commit profject configs, init update README, add README assets ([613d1ec](https://github.com/Nerdware-LLC/fixit-api/commit/613d1ec7bd92fd3d8a0f6fa7a632f3348fc6a756))

# 1.0.0 (2022-08-06)


### Features

* init update template-repo files ([2b52992](https://github.com/Nerdware-LLC/fixit-api/commit/2b52992fe8cc8553b73f711b3d84ee98dde98970))
