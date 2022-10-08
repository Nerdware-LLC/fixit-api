# Changelog

All notable changes to this project will be documented in this file.

---


# [1.11.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.10.0...v1.11.0) (2022-10-08)


### Features

* **EventEmitter:** add mock event handlers to EE for test env ([f313408](https://github.com/Nerdware-LLC/fixit-api/commit/f313408599f6a45e89d812a08cf29acec72e4d48))
* **MW-security:** convert from JW to TS, update staging/prod CORS origins ([39bccea](https://github.com/Nerdware-LLC/fixit-api/commit/39bccea1a50b562bbafbbca1a2c6ba5694ed81c8))
* **MW-stripeConnect:** convert from JW to TS, impl new Auth'd UserData type ([1784c0e](https://github.com/Nerdware-LLC/fixit-api/commit/1784c0e615cbe8388f570fbdf42aeb06c2664332))
* **Stripe-WHs:** convert handlers from JS to TS ([01c15f0](https://github.com/Nerdware-LLC/fixit-api/commit/01c15f08a15be9e9296d0bdc86e8484da3065c3c))
* **User-types:** add 'AuthenticatedUser' type for MW req objs ([d6203b7](https://github.com/Nerdware-LLC/fixit-api/commit/d6203b78e25f5c0d52d1233a3157b5c30beac0fe))
* **UserSCA:** add updateOne model method ([1962a1e](https://github.com/Nerdware-LLC/fixit-api/commit/1962a1e93d57f68bb370a9e2e0a6e68a5d7af46b))
* **UserSub:** add updateOne model method ([b31cbf8](https://github.com/Nerdware-LLC/fixit-api/commit/b31cbf84bfe0e8475e5f052702a246afe89f6b82))

# [1.10.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.9.0...v1.10.0) (2022-10-07)


### Bug Fixes

* **docker:** update file refs in docker-related files ([7853975](https://github.com/Nerdware-LLC/fixit-api/commit/7853975d79fd404112498ba01d6459d948831e43))


### Features

* **ECR-push:** add GitHub Action ecr_image_push ([54a5011](https://github.com/Nerdware-LLC/fixit-api/commit/54a50117e3ae0c9e7edd8f2933cecd321a7a978d))
* **gql:** convert gql schema,customScalars,deleteMutResp to TS ([6c253a6](https://github.com/Nerdware-LLC/fixit-api/commit/6c253a67c4dda4d4d9ce3b7dcd88afb99d5e20d6))

# [1.9.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.8.0...v1.9.0) (2022-10-07)


### Bug Fixes

* **DDB-ST:** add ExprAttrNames to auto-gen fn; correct transformValue hook logic ([d776be2](https://github.com/Nerdware-LLC/fixit-api/commit/d776be281f51cd47c439a6a0f27337e1f2d1d93f))
* **models:** add Model tests, correct schema where necessary ([aa24195](https://github.com/Nerdware-LLC/fixit-api/commit/aa2419579aa660e3fb183c41ef1e1e2b868dfc79))
* **util-regex:** add colon to possible chars in street line 2 ([e8b422a](https://github.com/Nerdware-LLC/fixit-api/commit/e8b422a2d13f1c37b271170522672b24d759b388))


### Features

* **models-tests:** add ddb batchDelete to afterAll models' tests ([16a6301](https://github.com/Nerdware-LLC/fixit-api/commit/16a6301769d1d769b461fcb02c41fa74dbd828ca))
* **tests:** add Jest globalSetup for ddb-local ([6f3ccac](https://github.com/Nerdware-LLC/fixit-api/commit/6f3ccace0dc5045a470e3871320c68108926cee1))
* **tsconfig:** add path alias '[@tests](https://github.com/tests)' for src/__tests__ ([7df046e](https://github.com/Nerdware-LLC/fixit-api/commit/7df046e42af55c84658e5568f2dd92c59c6c69b5))

# [1.8.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.7.0...v1.8.0) (2022-10-05)


### Bug Fixes

* **Model:** add 'doesHaveDefinedProperty', ensure IO actions account for undefined values ([e5e080d](https://github.com/Nerdware-LLC/fixit-api/commit/e5e080de5882e28a9239eff7974be27b26ad2256))
* **models:** ensure PHONE common attr doesnt pass undefined to transform fns ([e44ea1c](https://github.com/Nerdware-LLC/fixit-api/commit/e44ea1c1f681d0743bca52329958bd89f5635423))


### Features

* **WO:** add tests for WO.createOne, fix schema elements ([07ac0b4](https://github.com/Nerdware-LLC/fixit-api/commit/07ac0b44a69fbb2188cee7c75c9388174977aacd))

# [1.7.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.6.0...v1.7.0) (2022-10-05)


### Bug Fixes

* **DDB-ST:** correct type of obj returned from upsertItem ([519aa5f](https://github.com/Nerdware-LLC/fixit-api/commit/519aa5f3f9d0126b395c2f54c06900ca32ba9b05))
* **env:** correct Stripe env var name casing ([0ec8abb](https://github.com/Nerdware-LLC/fixit-api/commit/0ec8abb0d07b0ba22ec79306b4d21bfe98dd679e))


### Features

* **err-MW:** convert error-handler MW to TS ([ac623f0](https://github.com/Nerdware-LLC/fixit-api/commit/ac623f02260133e7a53280647aff8ea7132c2142))
* **getTypeSafeErr:** add explicit 'Error' return type ([c0873a4](https://github.com/Nerdware-LLC/fixit-api/commit/c0873a41b3ce0492f9203043ef37099bf92ae67c))
* **PN-MW:** convert 'updateExpoPushToken' to TS ([e084337](https://github.com/Nerdware-LLC/fixit-api/commit/e084337ffd76f1be55806bff005949460d305771))
* **Subs-MW:** combine 2 Sub-related MW into 1 and convert to TS ([74de686](https://github.com/Nerdware-LLC/fixit-api/commit/74de68630522421a00c10c9bb675f7c7af256595))
* **UserSub:** add tests covering UserSub methods ([0d82b3d](https://github.com/Nerdware-LLC/fixit-api/commit/0d82b3d48b08206e89c05b27064072cb9115d928))

# [1.6.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.5.1...v1.6.0) (2022-10-05)


### Bug Fixes

* **DDB-ST:** add table/index throughput config opts; add ListTables cmd ([bc9839c](https://github.com/Nerdware-LLC/fixit-api/commit/bc9839c7ffe698cd19fb1368ce10c4ff47816db3))
* **Invoice.createOne:** correct type to include required keys on create ([178ce46](https://github.com/Nerdware-LLC/fixit-api/commit/178ce467200ffa710fd8d739273754414b2608ad))
* **Jest:** update 'collectCoverageFrom' so jest properly reports coverage ([475debe](https://github.com/Nerdware-LLC/fixit-api/commit/475debe9c99d8df75767199fd67f2f30230eb067))
* **Jwt:** convert typeof jwt key to string ([c905331](https://github.com/Nerdware-LLC/fixit-api/commit/c905331d9386b151f73f44389b2699bf7e1c4a98))
* **Model:** correct aliasedSchema ctor logic; add return types to api methods ([344ccd3](https://github.com/Nerdware-LLC/fixit-api/commit/344ccd3fcc9a12352795b7921c44b13a12da0818))
* **User.createOne:** correct obj types to include 'sk' ([6fb523b](https://github.com/Nerdware-LLC/fixit-api/commit/6fb523b9c902f49b257695f1e7465eadfd94ea40))
* **WO.createOne:** correct new WO type ([2f80a15](https://github.com/Nerdware-LLC/fixit-api/commit/2f80a15dc608b50abcd29f4dd1a3f897aca1cf15))


### Features

* **AuthToken:** rm 'profile.id' from jwt payload ([3ec5399](https://github.com/Nerdware-LLC/fixit-api/commit/3ec5399479e5a10244bb854ad2bdbc41c35aee1c))
* **env:** rm unused 'directives.should_run_mocks' from ENV obj ([7015ded](https://github.com/Nerdware-LLC/fixit-api/commit/7015deda161506afe6b85fe50f79dd74d9e0c04e))
* **models:** add 'createdAt' and 'updatedAt' to all models ([65a1a1f](https://github.com/Nerdware-LLC/fixit-api/commit/65a1a1f2ccc410aa1bfea8e51fe930d7d60a504d))
* **MW-auth:** convert auth MW to TS ([d180c44](https://github.com/Nerdware-LLC/fixit-api/commit/d180c446f409133f42d16caae2f0792876e4a938))
* **MW-wrappers:** add _userQueryItems to Req type for pre-fetch queries ([97b0248](https://github.com/Nerdware-LLC/fixit-api/commit/97b0248ecf0aba699a1b28fdfe4c687c0fb96d07))
* **npm-test-scripts:** add DDB-local docker cmds to npm scripts ([1f6f977](https://github.com/Nerdware-LLC/fixit-api/commit/1f6f97753d8e82a82894e2b61741bc82a2d1ed0d))
* **tsconfig:** rm '[@types](https://github.com/types)' from tsconfig as it is unused ([2c5cac5](https://github.com/Nerdware-LLC/fixit-api/commit/2c5cac54f7406985f94d8ef18b88ecb226336c45))
* **User:** add test covering all User model methods ([3802624](https://github.com/Nerdware-LLC/fixit-api/commit/380262482da2b94d39dae5377dd3d5dc89ee8fd5))

## [1.5.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.5.0...v1.5.1) (2022-10-02)

# [1.5.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.4.1...v1.5.0) (2022-10-02)


### Bug Fixes

* **LambdaClient:** update payload type to allow objects to be passed into JSON.stringify ([cd85620](https://github.com/Nerdware-LLC/fixit-api/commit/cd8562040ba5b09dd1094e07f011bbd5c2bb28ea))
* **utils:** update utils index exports to export new util types ([f92b1cd](https://github.com/Nerdware-LLC/fixit-api/commit/f92b1cd9486f11e851ef8ad30299feec99856d78))


### Features

* **events:** convert all event handlers to TS ([1166ed8](https://github.com/Nerdware-LLC/fixit-api/commit/1166ed8d4a9279963e35d4256230165de7d6ee8e))
* **Models:** ensure all Model custom methods have param+return types ([d860c55](https://github.com/Nerdware-LLC/fixit-api/commit/d860c559209385d92572d933fc549b05957c1982))
* **type:** add 'UserType' return type to User.createOne ([caf2ed0](https://github.com/Nerdware-LLC/fixit-api/commit/caf2ed079c28674e6ff23de9cc1e63aa68d40a3c))
* **types:** add types for AuthToken ([5270fea](https://github.com/Nerdware-LLC/fixit-api/commit/5270feaf3851b6dd9446dbe0e7143f5c41f15041))
* **types:** add types for JWT-related values and util fns ([204d8ac](https://github.com/Nerdware-LLC/fixit-api/commit/204d8ac115c0779a1d450db3cc2390390b148036))
* **types:** add types for MW wrappers ([52c5ce5](https://github.com/Nerdware-LLC/fixit-api/commit/52c5ce57fc333442fd6764f17bf8a2b6ca9a26e0))
* **types:** convert 'getObjValuesByKeys' to TS, add types ([89fb684](https://github.com/Nerdware-LLC/fixit-api/commit/89fb6844554d11c7aaed96bfc64b3f0cecbe4d4e))
* **User:** add return types to User model custom methods ([a162e18](https://github.com/Nerdware-LLC/fixit-api/commit/a162e18ee21e9c9375230a01c4809251881bed8a))

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
