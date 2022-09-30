# Changelog

All notable changes to this project will be documented in this file.

---


## [1.4.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.4.0...v1.4.1) (2022-09-30)


### Bug Fixes

* **apollo:** commit delete old .js config file ([1557a10](https://github.com/Nerdware-LLC/fixit-api/commit/1557a10cd18a224f070dce3927652a92c99c4699))
* **apolloServer:** mv dynamic test-env imports out of ApolloServer inst call ([75f221a](https://github.com/Nerdware-LLC/fixit-api/commit/75f221a970711643ea13e252559548cdd3100929))
* **config-files:** update file extensions in config file settings ([5f050ee](https://github.com/Nerdware-LLC/fixit-api/commit/5f050eed6f34916eb47a2fd5a403133e3354566f))
* **DDB-ST:** correct Model.aliasMapping typings ([23923c9](https://github.com/Nerdware-LLC/fixit-api/commit/23923c976a7d4daf230484f6e504ad94b1e7166e))
* **DDB-ST:** misc eslint directives ([41c6c4c](https://github.com/Nerdware-LLC/fixit-api/commit/41c6c4c13619c3dec7752df18bfb3ea9044e576d))
* **eslint:** rm parserConfigs from overrides, was messing up parsing ([7a1a815](https://github.com/Nerdware-LLC/fixit-api/commit/7a1a8158470de61dd922e988cca2b2b21d871a3d))
* **models:** correct models' 'schema' property to as const for type parsing ([2fdb090](https://github.com/Nerdware-LLC/fixit-api/commit/2fdb0903d29ee660f647a9368d1fc67eda907ee5))
* **models:** mv User Sub/SCA types into own dirs, add 'Type' suffix ([9165e59](https://github.com/Nerdware-LLC/fixit-api/commit/9165e599a218036d2bb4085beec07e0eecb2a53a))
* **mw:** update mw with up-to-date Models/model enums ([6195562](https://github.com/Nerdware-LLC/fixit-api/commit/6195562b20dc50ec4bb713e32a7cdf899a04800c))
* **ts-build:** add 'build' tsconfig, update npm build script ([531a6db](https://github.com/Nerdware-LLC/fixit-api/commit/531a6db9738b3f9a8b17cc4d8ae4e44ae5017836))
* **utils:** rm dateTimeUtils, files now just use moment directly ([ae30523](https://github.com/Nerdware-LLC/fixit-api/commit/ae305238a9db943662b6593e6a24b4093d068244))

# [1.4.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.3.0...v1.4.0) (2022-09-29)


### Bug Fixes

* **DDB-ST-client:** rm default value from query opts ([7967570](https://github.com/Nerdware-LLC/fixit-api/commit/796757029c9bb5e1fecab734af3f8e26910378ed))
* **DDB-ST:** change toDB/fromDB call sigs to allow any ([e4102a4](https://github.com/Nerdware-LLC/fixit-api/commit/e4102a4afe4c4d6b27456ed5956a084ff1f566ea))
* **DDB-ST:** correct ioActions-related method param+return types ([b6a5bb4](https://github.com/Nerdware-LLC/fixit-api/commit/b6a5bb48cadefd03ba32772365872695026a4292))
* **DDB-ST:** rm'd extraneous class type params; nixed model() init method ([d68682f](https://github.com/Nerdware-LLC/fixit-api/commit/d68682f3a2cf7c19c554e38f961a39da5751d528))
* **eventEmitter:** add typings for FixitEventEmitter ([9e5af71](https://github.com/Nerdware-LLC/fixit-api/commit/9e5af716d77b4a3e5dd02abf7a5bc5d770187d6b))
* **models:** convert all Models to subclasses of DDBST Model ([11b6b47](https://github.com/Nerdware-LLC/fixit-api/commit/11b6b47dc10d80916a9d035b069403696c244476))


### Features

* **DDB-ST:** add conversion of types Date<-->Unix and Buffer<-->binary ([6a12601](https://github.com/Nerdware-LLC/fixit-api/commit/6a12601ba6f042ed5ccaa9bdfdb6dd5b0ecf28bf))
* **DDB-ST:** impl 'addModelMethods' feature which binds custom methods ([4909206](https://github.com/Nerdware-LLC/fixit-api/commit/4909206ad954016228fbd0c2192db67793fdb375))
* **Model.query:** add alias mapping to KeyConditionExpression ([a34622c](https://github.com/Nerdware-LLC/fixit-api/commit/a34622c931481bd08e813501fd2444509d9bd8ec))

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
