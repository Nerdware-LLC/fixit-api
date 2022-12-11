# Changelog

All notable changes to this project will be documented in this file.

---


# [1.16.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.15.0...v1.16.0) (2022-12-11)


### Bug Fixes

* **events:** rm destructure of possibly undefined value ([4515116](https://github.com/Nerdware-LLC/fixit-api/commit/4515116dde95b268570c37c0b4849f7eac3e4923))
* **wo-location:** replace abstract-interface w concrete gql type ([56da52a](https://github.com/Nerdware-LLC/fixit-api/commit/56da52ad49aa475be9cb88f49e282de0664ba521))


### Features

* **AuthToken:** add 'profile' to auth token fields ([a58be2a](https://github.com/Nerdware-LLC/fixit-api/commit/a58be2a63ce0da188d2219a9615dc89e2e481e78))
* **cors:** add headers for Apollo-Studio introspection in dev env ([7582f5b](https://github.com/Nerdware-LLC/fixit-api/commit/7582f5b2a1f26f30340c100feeee6cedb8cc6029))
* **env:** add APOLLO_STUDIO_INTROSPECTION_AUTH_TOKEN ([3e0c557](https://github.com/Nerdware-LLC/fixit-api/commit/3e0c557e076f560232258180fd603ac667c51b2e))
* **env:** add APOLLO_STUDIO_INTROSPECTION_AUTH_TOKEN ([068aa2e](https://github.com/Nerdware-LLC/fixit-api/commit/068aa2e51c7828ee4a40b0fc57de02dff8f212e9))
* **errors:** add static field for status code nums ([4cf1d58](https://github.com/Nerdware-LLC/fixit-api/commit/4cf1d5815494c037d86cf94bb2f80325a42e1589))
* **fixitUser:** add 'profile' to interface ([8210952](https://github.com/Nerdware-LLC/fixit-api/commit/821095229e106bc465dfac358001f1c21a365ef4))
* **gql-introspection:** correct isIntrospectionQuery logic ([784eb35](https://github.com/Nerdware-LLC/fixit-api/commit/784eb3596811ab5384f175dd3c583a512d4c4c06))
* **gql-profile:** rm field 'profile.id' ([fbdab9a](https://github.com/Nerdware-LLC/fixit-api/commit/fbdab9a678cf5fb0c65cd395e5076274b8b6caac))
* **gql-resolvers:** convert to TS with codegen typings ([39aa52a](https://github.com/Nerdware-LLC/fixit-api/commit/39aa52a2902ea4cb490104a8ffab13ae7e7b9e74))
* **gql-user:** rename gql-type SCA to UserSCA ([70f58a0](https://github.com/Nerdware-LLC/fixit-api/commit/70f58a0c85a33610ac2e755a25be881616c3518b))
* **myInvoices:** correct return type to separate own/assigned invoices ([10756cd](https://github.com/Nerdware-LLC/fixit-api/commit/10756cd6115e095811d472dd58e77bae7fa9272e))
* **userSCA:** add typedefs to schema file ([df8fb7e](https://github.com/Nerdware-LLC/fixit-api/commit/df8fb7ef122e29ae4901f2c2dd47afc2dd98b2d3))
* **validateReqBody:** add validateHasReturnURL for link-gen endpoints ([4a6f9fa](https://github.com/Nerdware-LLC/fixit-api/commit/4a6f9fa5aaaf501fb7152963b67f1eed2ca4c4c2))

# [1.15.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.14.0...v1.15.0) (2022-12-01)


### Features

* **apolloServer:** add plugins and typing for apollo context ([083a267](https://github.com/Nerdware-LLC/fixit-api/commit/083a267f480be2ca131c98ec09ec70368051c0ce))
* **apollo:** update apollo plugin config to use remote schema ([0d00129](https://github.com/Nerdware-LLC/fixit-api/commit/0d0012993a107f8b5fa8f61768196a6f2df700a7))
* **codegen:** add GQL-codegen config+scripts ([5694dec](https://github.com/Nerdware-LLC/fixit-api/commit/5694decdf43e982d89acc0ba95d360f3ef71dc0e))
* **cors:** add apollo+sentry related http headers and origins ([b5e4f95](https://github.com/Nerdware-LLC/fixit-api/commit/b5e4f95b2acdc5f4545b7c243ed1b5a0eddc7d40))
* **env:** separate 'SELF_URI' into component parts PROTOCOL and DOMAIN ([967a4c7](https://github.com/Nerdware-LLC/fixit-api/commit/967a4c763622fae94e49b0674ada8fc83d8f7324))
* **id-regex:** update Stripe-ID regexs to reflect variable length ([7ba2b48](https://github.com/Nerdware-LLC/fixit-api/commit/7ba2b48c16c1f11d609b78ea2516865464591689))
* **mw/auth:** improve edge-case handling for gql-ctx and queryUserItems ([1121422](https://github.com/Nerdware-LLC/fixit-api/commit/11214223431e34d51e30e2d4e342ea7dc6b3007d))
* **mw/clientInput:** rm 'promoCode' from required fields in submit-payment route ([7d404d1](https://github.com/Nerdware-LLC/fixit-api/commit/7d404d1809bfe66b678a19632a77aa1d1ef2a5e4))
* **mw/subs:** update logic in payment-handling mw ([3c073fc](https://github.com/Nerdware-LLC/fixit-api/commit/3c073fc2053f99e92f415255ba1225e32955fade))
* **mw/utils:** add type-safety check on req.body ([919c586](https://github.com/Nerdware-LLC/fixit-api/commit/919c586902eaeadc5e18d5002678a2366a3d0c03))
* **paths:** add src/types path aliases ([3f60729](https://github.com/Nerdware-LLC/fixit-api/commit/3f6072952fbcd5577065588c2d34db6699798047))
* **types:** add GQL codegen types ([0c5128d](https://github.com/Nerdware-LLC/fixit-api/commit/0c5128da2b8481d56d49c6d0c145aa467757ba7a))
* **types:** update fields available on ProcessEnv ([3d70739](https://github.com/Nerdware-LLC/fixit-api/commit/3d70739f787cd048b3d82feb21d8464d83a8c137))
* update ref to env var 'API_BASE_URL' ([6917fb4](https://github.com/Nerdware-LLC/fixit-api/commit/6917fb485afd5a7dd3394271d0921dc8b4efdf4a))

# [1.14.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.13.0...v1.14.0) (2022-11-07)


### Bug Fixes

* **apolloServer:** rm User type-cast in context fn ([178d65f](https://github.com/Nerdware-LLC/fixit-api/commit/178d65f551995bdbd4c50f9b6daed4ac5e2de3fb))
* **ci:** rm 'ci=false' from Semantic Release config file ([6cf9ba2](https://github.com/Nerdware-LLC/fixit-api/commit/6cf9ba261c9cbcf49ef12ef9dfeaa57463749cfd))
* **cors:** correct 'self-uri' origin regex ([ba161c6](https://github.com/Nerdware-LLC/fixit-api/commit/ba161c6c81d94f6e0132f60eae506fa508b3e2cf))
* **ECR-push:** correct docker push cmd syntax ([abdaf1f](https://github.com/Nerdware-LLC/fixit-api/commit/abdaf1f125f92c8f176903cfcede085bc3bb5cf4))
* **ECR-push:** correct docker push cmd syntax ([b94ccd7](https://github.com/Nerdware-LLC/fixit-api/commit/b94ccd78a6021c3e55ea92a85083145e5e41f8a9))
* **ECR-push:** correct docker tag syntax for push to ECR ([d5156fe](https://github.com/Nerdware-LLC/fixit-api/commit/d5156fedc139266879f14017d0c7a321a7e910cd))
* **errors:** convert old ApolloErrs into new GqlErrs ([786304b](https://github.com/Nerdware-LLC/fixit-api/commit/786304bb7d1d6eaa6ea97a6258122569ff303835))
* **jwt:** rm dupe protocol url-component from 'aud' ([dd7927a](https://github.com/Nerdware-LLC/fixit-api/commit/dd7927a7b07cbfa762a323997e9aa9233e1bb652))
* **MW-type:** change req._user type to include AuthTokenPayload union ([0b8b5ad](https://github.com/Nerdware-LLC/fixit-api/commit/0b8b5ad95d34210140b9798aaaa619e26a0b44ad))
* **mw:** update cors+httpHeaders mw to use /api base route ([d2d78bc](https://github.com/Nerdware-LLC/fixit-api/commit/d2d78bc8ab269027e28c13ef93e912e7b2ca4e68))
* **release:** correct filename for semantic release config file ([b1bfdf9](https://github.com/Nerdware-LLC/fixit-api/commit/b1bfdf9231b46a6b6be29724f62444c57d1e3e75))
* **User.createOne:** ensure SCA is attached to newUser ([da1bcdd](https://github.com/Nerdware-LLC/fixit-api/commit/da1bcdd4dedcfcc010d7a3b1a33f89f6ef9d6906))
* **validateReqBody:** correct keys req for auth routes ([669823b](https://github.com/Nerdware-LLC/fixit-api/commit/669823b9f5b408bc7f62017fb605f6a848ab854e))


### Features

* add '@types/cors' npm package to dev-deps ([dc53194](https://github.com/Nerdware-LLC/fixit-api/commit/dc53194fa5a050fe56115a86246811cc14cb999f))
* **apollo:** upgrade to Apollo Server v4 ([8a79211](https://github.com/Nerdware-LLC/fixit-api/commit/8a7921132df9dc9dfc2a2fb1dab6b163a7555732))
* **auth:** mv apolloServer context-auth fn into mw/auth ([20de0ad](https://github.com/Nerdware-LLC/fixit-api/commit/20de0adb5e6c425650c9633b47e9666eadb172f9))
* **authRouter:** add 'updateExpoPushToken' to login route ([162f9a0](https://github.com/Nerdware-LLC/fixit-api/commit/162f9a02ed5f706d6151fc31940827a4092b4c33))
* convert ConnectRouter and some MWs from js to ts ([343cccf](https://github.com/Nerdware-LLC/fixit-api/commit/343cccf5f3d407cd96fce100f15ae1040af71e4a))
* **Dockerfile:** change exposed port to 80 ([dfb2323](https://github.com/Nerdware-LLC/fixit-api/commit/dfb2323ca8d75f75cdb1784a47c764753bcd574a))
* **env:** rm unused keys from ENV object ([1fcd6bb](https://github.com/Nerdware-LLC/fixit-api/commit/1fcd6bbbdb7a4edb007407c7659d7bc88cf494eb))
* **errors:** add Gql custom errors to replace ApolloErrors ([462f816](https://github.com/Nerdware-LLC/fixit-api/commit/462f8167407855da2bf2c3c4fd5f5249ec5b4880))
* **Expand:** ensure Date objects are not 'expanded' ([8b22a82](https://github.com/Nerdware-LLC/fixit-api/commit/8b22a824462d7ff8f3cfd855b0c3a8592b5a056c))
* **getTypeSafeErr:** add option to override fallback err msg ([604f43a](https://github.com/Nerdware-LLC/fixit-api/commit/604f43af755bc108b78d3a37573c4b1a704d10ef))
* **gql:** migrate 'gql' tag imports to 'graphql-tag' for apollo-v4 ([e63feb7](https://github.com/Nerdware-LLC/fixit-api/commit/e63feb78aa1d0c7106021493c48ddff20bbb2a1e))
* **nvm:** add nvmrc config file ([4f64dff](https://github.com/Nerdware-LLC/fixit-api/commit/4f64dffd7b5618463737aa927c1b7a56f17a7feb))
* **routes:** update Stripe Link-mw to use /api base route ([3d3d555](https://github.com/Nerdware-LLC/fixit-api/commit/3d3d5556c7ada4762abd58306e768d1c70d7ba36))
* **server:** migrate expressApp+apolloServer to apollo-v4 ([a8f7997](https://github.com/Nerdware-LLC/fixit-api/commit/a8f79976078dfea978db9a07b66f7dd6d01da3a8))
* **Stripe-WHs:** rm old 'secret-bucket' env var ([b07ea41](https://github.com/Nerdware-LLC/fixit-api/commit/b07ea414d677d193fc96e19b91a0483c518c2fab))
* **Stripe-WHs:** rm s3client, update StripeWebhooksHandler ([a7f1399](https://github.com/Nerdware-LLC/fixit-api/commit/a7f13992f221b096b51056b81e6c8c31300d2c46))
* **types:** rm unused keys from process.env ambient typedef ([c86a2f5](https://github.com/Nerdware-LLC/fixit-api/commit/c86a2f57edbe140701de298379350dec022bb28f))
* **User:** convert 'expoPushToken' to optional create param for non-mobile ([b55620c](https://github.com/Nerdware-LLC/fixit-api/commit/b55620cac65137768cbc663883c215889173f0ac))

# [1.13.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.12.1...v1.13.0) (2022-10-08)


### Bug Fixes

* **Dockerfile:** swap build flag '--production' for '--omit=dev' ([89a81b0](https://github.com/Nerdware-LLC/fixit-api/commit/89a81b069d810d5529153f9a515698bcff3dd411))


### Features

* **colors:** uninstall unnecessary @types/colors pkg ([db36a0c](https://github.com/Nerdware-LLC/fixit-api/commit/db36a0c9ae1ebf679ff882d4dfe091626205031a))
* **ECR-push:** add workflow_dispatch trigger to allow manual runs ([5c5dd6e](https://github.com/Nerdware-LLC/fixit-api/commit/5c5dd6e7c4e345fefd833b3526af1e433cdfd8ce))
* **ECR-push:** on 'release' events swap tags main/next w prod/staging ([703d4e7](https://github.com/Nerdware-LLC/fixit-api/commit/703d4e7a18647505ac100003a42cdf568a23d4e8))

## [1.12.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.12.0...v1.12.1) (2022-10-08)


### Bug Fixes

* **releaserc:** add package.json assets to SR/git plugin ([7af3e6f](https://github.com/Nerdware-LLC/fixit-api/commit/7af3e6f957a8e22b80a8e82c5684dc34a61b0c09))

# [1.12.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.11.0...v1.12.0) (2022-10-08)


### Bug Fixes

* **ECR-push:** rm push-events from event triggers, only on release now ([a03c954](https://github.com/Nerdware-LLC/fixit-api/commit/a03c954379765b4032aaa549006f4a8a9cb6b519))
* **release-action:** add releaserc to file triggers ([e35ce21](https://github.com/Nerdware-LLC/fixit-api/commit/e35ce2194fbadb8374194c5ec1b519851ffe4d58))


### Features

* **SemanticRelease:** add npm release plugin, rm unused release rules ([f28201d](https://github.com/Nerdware-LLC/fixit-api/commit/f28201dc87d47260b90da72c11745c2d841671ab))

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
