# Changelog

All notable changes to this project will be documented in this file.

---

# [2.2.0](https://github.com/Nerdware-LLC/fixit-api/compare/v2.1.4...v2.2.0) (2024-08-06)


### Bug Fixes

* add check for nullish req.body ([d770924](https://github.com/Nerdware-LLC/fixit-api/commit/d770924c62b43776d7bfad76d0b7e9a61d115ab1))
* add check for undefined req.body ([36facb4](https://github.com/Nerdware-LLC/fixit-api/commit/36facb471b8511b560125d496db27a7aa351e491))
* add default str for nullish paymentIntentID value ([0ff42ea](https://github.com/Nerdware-LLC/fixit-api/commit/0ff42ea85326fc210fa9f056fe00e9f9a1628741))
* add explicit 'unknown' typing to err params in catch ([54ce108](https://github.com/Nerdware-LLC/fixit-api/commit/54ce10855cfc21d1737ef27c7f84c9d7a10c2bb1))
* add fallback str in case req.ip is nullish ([0b819f5](https://github.com/Nerdware-LLC/fixit-api/commit/0b819f51f4fcf0947708fe0e450cabcab23f9bbf))
* add handle lookup to ensure uniqueness ([dd8536a](https://github.com/Nerdware-LLC/fixit-api/commit/dd8536a8c8c9bb704b7077c8450297a1e7b5f093))
* add opt chains for nullish lookups ([063adbe](https://github.com/Nerdware-LLC/fixit-api/commit/063adbec588ba244068e93377526bda4e5971295))
* add status400ForVariableCoercionErrors:true per apollo recommendation ([6cb5a21](https://github.com/Nerdware-LLC/fixit-api/commit/6cb5a21a21168363074c124c369ca40b430228b0))
* correct imports ([97e5e07](https://github.com/Nerdware-LLC/fixit-api/commit/97e5e07433a9d99ed8c66abd33bf40c4a65f7131))
* correct the 200 response to 200AuthTokenAndPreFetchedUserItems ([36cc8d3](https://github.com/Nerdware-LLC/fixit-api/commit/36cc8d3102cf9a019c8cb9964d16db9f551464ee))
* **mock:** promisify return type of InvokeCommand ([cf663a9](https://github.com/Nerdware-LLC/fixit-api/commit/cf663a94293eb81644b66fdce88bb8654f7dd216))
* **mock:** promisify return type of SendMessagesCommand ([fc4eba4](https://github.com/Nerdware-LLC/fixit-api/commit/fc4eba4416df35ac5f52af2ea21ad767ac15024c))
* replace sanitizeID w correct regex impl ([f9145b4](https://github.com/Nerdware-LLC/fixit-api/commit/f9145b427ca11c80c8684f800ec7dd97030c0271))
* rm export of deleted express types file ([b04e5e6](https://github.com/Nerdware-LLC/fixit-api/commit/b04e5e6c4981f407a5ef7f6b214abf5823168b23))
* rm unnecessary as-cast from obj.__typename ([d681187](https://github.com/Nerdware-LLC/fixit-api/commit/d681187288e603e4e49deaebfc9585ec7664ee4c))
* update ENV value paths ([115f51b](https://github.com/Nerdware-LLC/fixit-api/commit/115f51bf310ba6690a20e941c0b89af41d791aca))
* update GQL codegen's types w Context typing and docstring descriptions ([026a1ef](https://github.com/Nerdware-LLC/fixit-api/commit/026a1ef07660c1cd2b571eb0965fa5365c89194d))
* update regex used to skip webhooks body parsing ([df8aadf](https://github.com/Nerdware-LLC/fixit-api/commit/df8aadfbbe1c31efbe8e59cdbe8a52540e2e0e8a))
* update req.body type to be possibly undefined ([f200471](https://github.com/Nerdware-LLC/fixit-api/commit/f200471303af190fedc6cda3b9ce4c8f0d5424c1))


### Features

* add auth method verifyUserIsAuthorizedToAccessPaidContent ([bd59a3d](https://github.com/Nerdware-LLC/fixit-api/commit/bd59a3dbd85b77261fe79a159e28a6890d1e614e))
* add ContactService ([3d0e228](https://github.com/Nerdware-LLC/fixit-api/commit/3d0e2287408a0baf7e0b3b06e71efaa9fbfa8802))
* add emit 'CheckoutCompleted' event ([c79c011](https://github.com/Nerdware-LLC/fixit-api/commit/c79c0114cbac47a65bbb876e80a94b066db98576))
* add env vars for v5 UUID namespace and others ([d2cfd4d](https://github.com/Nerdware-LLC/fixit-api/commit/d2cfd4da13b1dc81976884c2e0db236b7c23697e))
* add error-handling to `sendMessages` ([8001abe](https://github.com/Nerdware-LLC/fixit-api/commit/8001abe0ccff522c4a5af7d0cb9872f268b2540c))
* add event 'CheckoutCompleted' and handler `sendConfirmationEmail` ([e541826](https://github.com/Nerdware-LLC/fixit-api/commit/e5418266e07cdb70d4e656ac2c98b5e65c13140f))
* add httpServer wrapper ([1c52013](https://github.com/Nerdware-LLC/fixit-api/commit/1c52013670ce738e5d22286f6d0d484c19948e18))
* add InvoiceService ([5712d61](https://github.com/Nerdware-LLC/fixit-api/commit/5712d61315d95a7cec39741cbde9713747e1b0a1))
* add method 'getUserByHandleOrID' ([a14f92a](https://github.com/Nerdware-LLC/fixit-api/commit/a14f92a586b2de12b56d7bbed455d058e75de988))
* add pinpoint sdk, lib wrapper, and SendMessages invocations ([d7ba6a2](https://github.com/Nerdware-LLC/fixit-api/commit/d7ba6a21d1f5de6f152801e4c39c3091add164e6))
* add reset-password functionality ([b7b7c41](https://github.com/Nerdware-LLC/fixit-api/commit/b7b7c41ebc1c597094e5f07bd7208c640a8a646a))
* add type BaseEventHandler for static EVENT_HANDLERS ([7d210e8](https://github.com/Nerdware-LLC/fixit-api/commit/7d210e8f35a359b3f3244e568dd806e9538ea73a))
* add UserService method 'getUserByHandleOrID' ([7ffb750](https://github.com/Nerdware-LLC/fixit-api/commit/7ffb7507cbeed2179ec33b176b81a4b9b40e526b))
* add WorkOrderService ([58422cf](https://github.com/Nerdware-LLC/fixit-api/commit/58422cfab997358d16a6c5aafe080daad04e3ad6))
* add zod schema for gql input types ([cccc837](https://github.com/Nerdware-LLC/fixit-api/commit/cccc83742e9cc23dee63283b7d57a928175cdff1))
* add zod-related util types ([4e72dc1](https://github.com/Nerdware-LLC/fixit-api/commit/4e72dc16fdb85116de075c498a0022259681c782))
* migrate FixitUser interface to PublicUserFields ([daa0393](https://github.com/Nerdware-LLC/fixit-api/commit/daa039384737ae3dbd37c24023be9233ad5ab47c))
* rm AuthToken gql typeDef ([e2fa376](https://github.com/Nerdware-LLC/fixit-api/commit/e2fa3764160bb15cfbce29ae9dddf7aa9e6f6f2b))
* rm GQL-specific HttpError classes ([9a3a683](https://github.com/Nerdware-LLC/fixit-api/commit/9a3a6836f663ecd27fb9f0d9a5e9ef37d59b2dd1))
* rm old method ([677af6f](https://github.com/Nerdware-LLC/fixit-api/commit/677af6f9a82e81a0f7d04c0a634d130c9af60c05))
* rm res.locals types ([686bef2](https://github.com/Nerdware-LLC/fixit-api/commit/686bef2c81459d9767ec512aef0ce60a86d4c0c4))
* rm unused sanitizeStripeID fn ([0e6c2e6](https://github.com/Nerdware-LLC/fixit-api/commit/0e6c2e6d1a1cc8a21391e22e76180ed511306b9c))

# [2.2.0-next.1](https://github.com/Nerdware-LLC/fixit-api/compare/v2.1.2...v2.2.0-next.1) (2024-08-06)


### Bug Fixes

* add check for nullish req.body ([d770924](https://github.com/Nerdware-LLC/fixit-api/commit/d770924c62b43776d7bfad76d0b7e9a61d115ab1))
* add check for undefined req.body ([36facb4](https://github.com/Nerdware-LLC/fixit-api/commit/36facb471b8511b560125d496db27a7aa351e491))
* add default str for nullish paymentIntentID value ([0ff42ea](https://github.com/Nerdware-LLC/fixit-api/commit/0ff42ea85326fc210fa9f056fe00e9f9a1628741))
* add explicit 'unknown' typing to err params in catch ([54ce108](https://github.com/Nerdware-LLC/fixit-api/commit/54ce10855cfc21d1737ef27c7f84c9d7a10c2bb1))
* add fallback str in case req.ip is nullish ([0b819f5](https://github.com/Nerdware-LLC/fixit-api/commit/0b819f51f4fcf0947708fe0e450cabcab23f9bbf))
* add handle lookup to ensure uniqueness ([dd8536a](https://github.com/Nerdware-LLC/fixit-api/commit/dd8536a8c8c9bb704b7077c8450297a1e7b5f093))
* add opt chains for nullish lookups ([063adbe](https://github.com/Nerdware-LLC/fixit-api/commit/063adbec588ba244068e93377526bda4e5971295))
* add status400ForVariableCoercionErrors:true per apollo recommendation ([6cb5a21](https://github.com/Nerdware-LLC/fixit-api/commit/6cb5a21a21168363074c124c369ca40b430228b0))
* correct imports ([97e5e07](https://github.com/Nerdware-LLC/fixit-api/commit/97e5e07433a9d99ed8c66abd33bf40c4a65f7131))
* correct the 200 response to 200AuthTokenAndPreFetchedUserItems ([36cc8d3](https://github.com/Nerdware-LLC/fixit-api/commit/36cc8d3102cf9a019c8cb9964d16db9f551464ee))
* **mock:** promisify return type of InvokeCommand ([cf663a9](https://github.com/Nerdware-LLC/fixit-api/commit/cf663a94293eb81644b66fdce88bb8654f7dd216))
* **mock:** promisify return type of SendMessagesCommand ([fc4eba4](https://github.com/Nerdware-LLC/fixit-api/commit/fc4eba4416df35ac5f52af2ea21ad767ac15024c))
* replace sanitizeID w correct regex impl ([f9145b4](https://github.com/Nerdware-LLC/fixit-api/commit/f9145b427ca11c80c8684f800ec7dd97030c0271))
* rm export of deleted express types file ([b04e5e6](https://github.com/Nerdware-LLC/fixit-api/commit/b04e5e6c4981f407a5ef7f6b214abf5823168b23))
* rm unnecessary as-cast from obj.__typename ([d681187](https://github.com/Nerdware-LLC/fixit-api/commit/d681187288e603e4e49deaebfc9585ec7664ee4c))
* update ENV value paths ([115f51b](https://github.com/Nerdware-LLC/fixit-api/commit/115f51bf310ba6690a20e941c0b89af41d791aca))
* update GQL codegen's types w Context typing and docstring descriptions ([026a1ef](https://github.com/Nerdware-LLC/fixit-api/commit/026a1ef07660c1cd2b571eb0965fa5365c89194d))
* update regex used to skip webhooks body parsing ([df8aadf](https://github.com/Nerdware-LLC/fixit-api/commit/df8aadfbbe1c31efbe8e59cdbe8a52540e2e0e8a))
* update req.body type to be possibly undefined ([f200471](https://github.com/Nerdware-LLC/fixit-api/commit/f200471303af190fedc6cda3b9ce4c8f0d5424c1))


### Features

* add auth method verifyUserIsAuthorizedToAccessPaidContent ([bd59a3d](https://github.com/Nerdware-LLC/fixit-api/commit/bd59a3dbd85b77261fe79a159e28a6890d1e614e))
* add ContactService ([3d0e228](https://github.com/Nerdware-LLC/fixit-api/commit/3d0e2287408a0baf7e0b3b06e71efaa9fbfa8802))
* add emit 'CheckoutCompleted' event ([c79c011](https://github.com/Nerdware-LLC/fixit-api/commit/c79c0114cbac47a65bbb876e80a94b066db98576))
* add env vars for v5 UUID namespace and others ([d2cfd4d](https://github.com/Nerdware-LLC/fixit-api/commit/d2cfd4da13b1dc81976884c2e0db236b7c23697e))
* add error-handling to `sendMessages` ([8001abe](https://github.com/Nerdware-LLC/fixit-api/commit/8001abe0ccff522c4a5af7d0cb9872f268b2540c))
* add event 'CheckoutCompleted' and handler `sendConfirmationEmail` ([e541826](https://github.com/Nerdware-LLC/fixit-api/commit/e5418266e07cdb70d4e656ac2c98b5e65c13140f))
* add httpServer wrapper ([1c52013](https://github.com/Nerdware-LLC/fixit-api/commit/1c52013670ce738e5d22286f6d0d484c19948e18))
* add InvoiceService ([5712d61](https://github.com/Nerdware-LLC/fixit-api/commit/5712d61315d95a7cec39741cbde9713747e1b0a1))
* add method 'getUserByHandleOrID' ([a14f92a](https://github.com/Nerdware-LLC/fixit-api/commit/a14f92a586b2de12b56d7bbed455d058e75de988))
* add pinpoint sdk, lib wrapper, and SendMessages invocations ([d7ba6a2](https://github.com/Nerdware-LLC/fixit-api/commit/d7ba6a21d1f5de6f152801e4c39c3091add164e6))
* add reset-password functionality ([b7b7c41](https://github.com/Nerdware-LLC/fixit-api/commit/b7b7c41ebc1c597094e5f07bd7208c640a8a646a))
* add type BaseEventHandler for static EVENT_HANDLERS ([7d210e8](https://github.com/Nerdware-LLC/fixit-api/commit/7d210e8f35a359b3f3244e568dd806e9538ea73a))
* add UserService method 'getUserByHandleOrID' ([7ffb750](https://github.com/Nerdware-LLC/fixit-api/commit/7ffb7507cbeed2179ec33b176b81a4b9b40e526b))
* add WorkOrderService ([58422cf](https://github.com/Nerdware-LLC/fixit-api/commit/58422cfab997358d16a6c5aafe080daad04e3ad6))
* add zod schema for gql input types ([cccc837](https://github.com/Nerdware-LLC/fixit-api/commit/cccc83742e9cc23dee63283b7d57a928175cdff1))
* add zod-related util types ([4e72dc1](https://github.com/Nerdware-LLC/fixit-api/commit/4e72dc16fdb85116de075c498a0022259681c782))
* migrate FixitUser interface to PublicUserFields ([daa0393](https://github.com/Nerdware-LLC/fixit-api/commit/daa039384737ae3dbd37c24023be9233ad5ab47c))
* rm AuthToken gql typeDef ([e2fa376](https://github.com/Nerdware-LLC/fixit-api/commit/e2fa3764160bb15cfbce29ae9dddf7aa9e6f6f2b))
* rm GQL-specific HttpError classes ([9a3a683](https://github.com/Nerdware-LLC/fixit-api/commit/9a3a6836f663ecd27fb9f0d9a5e9ef37d59b2dd1))
* rm old method ([677af6f](https://github.com/Nerdware-LLC/fixit-api/commit/677af6f9a82e81a0f7d04c0a634d130c9af60c05))
* rm res.locals types ([686bef2](https://github.com/Nerdware-LLC/fixit-api/commit/686bef2c81459d9767ec512aef0ce60a86d4c0c4))
* rm unused sanitizeStripeID fn ([0e6c2e6](https://github.com/Nerdware-LLC/fixit-api/commit/0e6c2e6d1a1cc8a21391e22e76180ed511306b9c))

## [2.1.4](https://github.com/Nerdware-LLC/fixit-api/compare/v2.1.3...v2.1.4) (2024-04-04)

## [2.1.3](https://github.com/Nerdware-LLC/fixit-api/compare/v2.1.2...v2.1.3) (2024-04-03)

## [2.1.2](https://github.com/Nerdware-LLC/fixit-api/compare/v2.1.1...v2.1.2) (2024-03-26)

## [2.1.1](https://github.com/Nerdware-LLC/fixit-api/compare/v2.1.0...v2.1.1) (2024-03-26)


### Bug Fixes

* add '.js' extensions to local imports ([7210346](https://github.com/Nerdware-LLC/fixit-api/commit/7210346bd5cdb7f609f47e3b19edb8c887ff201d))

## [2.1.1-next.1](https://github.com/Nerdware-LLC/fixit-api/compare/v2.1.0...v2.1.1-next.1) (2024-03-26)


### Bug Fixes

* add '.js' extensions to local imports ([7210346](https://github.com/Nerdware-LLC/fixit-api/commit/7210346bd5cdb7f609f47e3b19edb8c887ff201d))

# [2.1.0](https://github.com/Nerdware-LLC/fixit-api/compare/v2.0.1...v2.1.0) (2024-03-24)


### Bug Fixes

* correct DateTime validity logic ([6273a0a](https://github.com/Nerdware-LLC/fixit-api/commit/6273a0a4e4d6df5b466272769ab5f621a1a9d9e4))
* ensure every next call wraps an Error ([9efc8e5](https://github.com/Nerdware-LLC/fixit-api/commit/9efc8e58eedd6d54db2ab7f9bb58f30025bf986b))
* update google OAuth related logic ([9fa247b](https://github.com/Nerdware-LLC/fixit-api/commit/9fa247b11d083166650e81f2eb75a57701b10dc2))


### Features

* add Google OAuth2 client ([5529074](https://github.com/Nerdware-LLC/fixit-api/commit/5529074517b445d8ab9b3814995ae68dfc837b3e))
* add googleID/googleIDToken handling ([0f8df48](https://github.com/Nerdware-LLC/fixit-api/commit/0f8df48eb6f664346515e93083f825356a49438f))
* add isValidTimestamp util ([ce20e7f](https://github.com/Nerdware-LLC/fixit-api/commit/ce20e7f2e928644764ddc20c77e2f950d7948f6c))
* rm requirement for user.sca.id ([e46c681](https://github.com/Nerdware-LLC/fixit-api/commit/e46c6816f79592b4432629389c3b3653e673df36))
* set 'phone' and sca fields to allow null ([4fa7ccf](https://github.com/Nerdware-LLC/fixit-api/commit/4fa7ccfdd39e6f443928c31b078ed27709ce6b22))
* update codegen'd types ([7cf2141](https://github.com/Nerdware-LLC/fixit-api/commit/7cf21412be8bf58cb2afd2d25f0dc8ad0c6a548f))
* update local gql shema file for nullable phone ([9e98c85](https://github.com/Nerdware-LLC/fixit-api/commit/9e98c85af321f17e6121b9a11646ee5b4de10104))
* update logic to allow 'phone' to be optional ([b2df714](https://github.com/Nerdware-LLC/fixit-api/commit/b2df7145e91f70282fe57b786323900b58e9f9bc))

# [2.1.0-next.1](https://github.com/Nerdware-LLC/fixit-api/compare/v2.0.1...v2.1.0-next.1) (2024-03-24)


### Bug Fixes

* correct DateTime validity logic ([6273a0a](https://github.com/Nerdware-LLC/fixit-api/commit/6273a0a4e4d6df5b466272769ab5f621a1a9d9e4))
* ensure every next call wraps an Error ([9efc8e5](https://github.com/Nerdware-LLC/fixit-api/commit/9efc8e58eedd6d54db2ab7f9bb58f30025bf986b))
* update google OAuth related logic ([9fa247b](https://github.com/Nerdware-LLC/fixit-api/commit/9fa247b11d083166650e81f2eb75a57701b10dc2))


### Features

* add Google OAuth2 client ([5529074](https://github.com/Nerdware-LLC/fixit-api/commit/5529074517b445d8ab9b3814995ae68dfc837b3e))
* add googleID/googleIDToken handling ([0f8df48](https://github.com/Nerdware-LLC/fixit-api/commit/0f8df48eb6f664346515e93083f825356a49438f))
* add isValidTimestamp util ([ce20e7f](https://github.com/Nerdware-LLC/fixit-api/commit/ce20e7f2e928644764ddc20c77e2f950d7948f6c))
* rm requirement for user.sca.id ([e46c681](https://github.com/Nerdware-LLC/fixit-api/commit/e46c6816f79592b4432629389c3b3653e673df36))
* set 'phone' and sca fields to allow null ([4fa7ccf](https://github.com/Nerdware-LLC/fixit-api/commit/4fa7ccfdd39e6f443928c31b078ed27709ce6b22))
* update codegen'd types ([7cf2141](https://github.com/Nerdware-LLC/fixit-api/commit/7cf21412be8bf58cb2afd2d25f0dc8ad0c6a548f))
* update local gql shema file for nullable phone ([9e98c85](https://github.com/Nerdware-LLC/fixit-api/commit/9e98c85af321f17e6121b9a11646ee5b4de10104))
* update logic to allow 'phone' to be optional ([b2df714](https://github.com/Nerdware-LLC/fixit-api/commit/b2df7145e91f70282fe57b786323900b58e9f9bc))

## [2.0.1](https://github.com/Nerdware-LLC/fixit-api/compare/v2.0.0...v2.0.1) (2024-03-10)

## [2.0.1-next.1](https://github.com/Nerdware-LLC/fixit-api/compare/v2.0.0...v2.0.1-next.1) (2024-03-10)

# [2.0.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.23.1...v2.0.0) (2024-03-10)


### Bug Fixes

* ensure 'isIntrospectionQuery' only enabled in dev ([49af168](https://github.com/Nerdware-LLC/fixit-api/commit/49af168fd9a740da6c0cadc46826d006c604ff9e))
* pass ignore+rule-code as separate args ([45fd16a](https://github.com/Nerdware-LLC/fixit-api/commit/45fd16a63e30ab312a86891a57c4d9d1acaf4bcf))
* rm ErrorClass param for expected parsing ([8d28b1b](https://github.com/Nerdware-LLC/fixit-api/commit/8d28b1bec12121b3830712e86493abfaba9958f2))
* rm file extensions from imports ([74594e8](https://github.com/Nerdware-LLC/fixit-api/commit/74594e84efec7bf2f7e4c44d0abf30ab5d849550))
* **test:** add 'as any' to fake lambda fn names in test ([1828de3](https://github.com/Nerdware-LLC/fixit-api/commit/1828de3ab8a70d3c8b8c25cdba6bfe939ebc76e9))


### Features

* add ENV property IS_DEPLOYED_ENV ([d6a0207](https://github.com/Nerdware-LLC/fixit-api/commit/d6a02073caf72665021a4a9a3175f50dd8a5cb3f))
* add lambda fn name enum ([3bc9fd8](https://github.com/Nerdware-LLC/fixit-api/commit/3bc9fd80e77d9da03b2fe47c396d2a27ceea3dfb))
* add separate csp sources for fixit-web and the api ([fbf767e](https://github.com/Nerdware-LLC/fixit-api/commit/fbf767ea6679e4681c9bce77d9285657c3c713e2))
* convert entire project to 'module:NodeNext' ([73186ee](https://github.com/Nerdware-LLC/fixit-api/commit/73186ee8f4c805da092845a6cf91e3262af05c79))
* **csp:** update csp directives ([1e2400a](https://github.com/Nerdware-LLC/fixit-api/commit/1e2400ae27bde9b00c3ffe559a3dbeb921097ac9))
* disable 'view cache' and 'x-powered-by' ([0fef87a](https://github.com/Nerdware-LLC/fixit-api/commit/0fef87ac9bf8b395c6b1101d4c576f1b12899528))
* enable 'trust proxy' in deployed envs ([ccad7cd](https://github.com/Nerdware-LLC/fixit-api/commit/ccad7cd899304e58e54adabe786ec22f82f65144))
* enable includeStacktraceInErrorResponses in non-prod envs ([e5a4910](https://github.com/Nerdware-LLC/fixit-api/commit/e5a4910d95449a78e9c48caaa65020e9961e5480))
* ensure logs go to CloudWatch in deployed envs ([77885a8](https://github.com/Nerdware-LLC/fixit-api/commit/77885a8db025c3be81cbc5439994e1e0144c766e))
* rm 'cookies', add 'ip' to data in Sentry scope ([b2d8969](https://github.com/Nerdware-LLC/fixit-api/commit/b2d89690fc6a08504a36d542b675bb8e907d54bd))
* rm logging of healthcheck reqs ([da79680](https://github.com/Nerdware-LLC/fixit-api/commit/da796806bd9aa1a94a97aa23f5bfa86c665c8aa8))
* rm timestamps from logs sent to CloudWatch ([9b39d8c](https://github.com/Nerdware-LLC/fixit-api/commit/9b39d8c46ab651f28e96859f32fb5c362c5efe38))
* set prod stage to use node:20-slim, rm base stage ([2da0c39](https://github.com/Nerdware-LLC/fixit-api/commit/2da0c397b458f6ba30483f0f8d6c119d53db1db5))
* use swc 'resolveFully' to re-impl dir index imports ([61dcda5](https://github.com/Nerdware-LLC/fixit-api/commit/61dcda5ac1959be9dee05766c7f0e1f76d06684c))


### BREAKING CHANGES

* that impacts nearly every file in the project. The new
module system facilitates using NodeJS v20 in deployed environments
(staging and prod). Previously, file extensions had been omitted from
import statements, but now they are required. This was made necessary by
node v20 dropping support for the experimental module resolution flag(s)
used in previous node versions (`--experimental-specifier-resolution=node`).
The deployment process will now be much more reliable.
* whole new module import system

# [2.0.0-next.6](https://github.com/Nerdware-LLC/fixit-api/compare/v2.0.0-next.5...v2.0.0-next.6) (2024-03-09)


### Bug Fixes

* ensure 'isIntrospectionQuery' only enabled in dev ([49af168](https://github.com/Nerdware-LLC/fixit-api/commit/49af168fd9a740da6c0cadc46826d006c604ff9e))


### Features

* enable includeStacktraceInErrorResponses in non-prod envs ([e5a4910](https://github.com/Nerdware-LLC/fixit-api/commit/e5a4910d95449a78e9c48caaa65020e9961e5480))
* rm timestamps from logs sent to CloudWatch ([9b39d8c](https://github.com/Nerdware-LLC/fixit-api/commit/9b39d8c46ab651f28e96859f32fb5c362c5efe38))

# [2.0.0-next.6](https://github.com/Nerdware-LLC/fixit-api/compare/v2.0.0-next.5...v2.0.0-next.6) (2024-03-07)


### Bug Fixes

* ensure 'isIntrospectionQuery' only enabled in dev ([49af168](https://github.com/Nerdware-LLC/fixit-api/commit/49af168fd9a740da6c0cadc46826d006c604ff9e))


### Features

* enable includeStacktraceInErrorResponses in non-prod envs ([e5a4910](https://github.com/Nerdware-LLC/fixit-api/commit/e5a4910d95449a78e9c48caaa65020e9961e5480))
* rm timestamps from logs sent to CloudWatch ([9b39d8c](https://github.com/Nerdware-LLC/fixit-api/commit/9b39d8c46ab651f28e96859f32fb5c362c5efe38))

# [2.0.0-next.5](https://github.com/Nerdware-LLC/fixit-api/compare/v2.0.0-next.4...v2.0.0-next.5) (2024-03-05)


### Features

* ensure logs go to CloudWatch in deployed envs ([77885a8](https://github.com/Nerdware-LLC/fixit-api/commit/77885a8db025c3be81cbc5439994e1e0144c766e))

# [2.0.0-next.4](https://github.com/Nerdware-LLC/fixit-api/compare/v2.0.0-next.3...v2.0.0-next.4) (2024-03-03)


### Bug Fixes

* pass ignore+rule-code as separate args ([45fd16a](https://github.com/Nerdware-LLC/fixit-api/commit/45fd16a63e30ab312a86891a57c4d9d1acaf4bcf))
* rm ErrorClass param for expected parsing ([8d28b1b](https://github.com/Nerdware-LLC/fixit-api/commit/8d28b1bec12121b3830712e86493abfaba9958f2))


### Features

* rm logging of healthcheck reqs ([da79680](https://github.com/Nerdware-LLC/fixit-api/commit/da796806bd9aa1a94a97aa23f5bfa86c665c8aa8))
* set prod stage to use node:20-slim, rm base stage ([2da0c39](https://github.com/Nerdware-LLC/fixit-api/commit/2da0c397b458f6ba30483f0f8d6c119d53db1db5))

# [2.0.0-next.3](https://github.com/Nerdware-LLC/fixit-api/compare/v2.0.0-next.2...v2.0.0-next.3) (2024-03-02)


### Features

* add ENV property IS_DEPLOYED_ENV ([d6a0207](https://github.com/Nerdware-LLC/fixit-api/commit/d6a02073caf72665021a4a9a3175f50dd8a5cb3f))
* add separate csp sources for fixit-web and the api ([fbf767e](https://github.com/Nerdware-LLC/fixit-api/commit/fbf767ea6679e4681c9bce77d9285657c3c713e2))
* disable 'view cache' and 'x-powered-by' ([0fef87a](https://github.com/Nerdware-LLC/fixit-api/commit/0fef87ac9bf8b395c6b1101d4c576f1b12899528))
* enable 'trust proxy' in deployed envs ([ccad7cd](https://github.com/Nerdware-LLC/fixit-api/commit/ccad7cd899304e58e54adabe786ec22f82f65144))
* rm 'cookies', add 'ip' to data in Sentry scope ([b2d8969](https://github.com/Nerdware-LLC/fixit-api/commit/b2d89690fc6a08504a36d542b675bb8e907d54bd))

# [2.0.0-next.2](https://github.com/Nerdware-LLC/fixit-api/compare/v2.0.0-next.1...v2.0.0-next.2) (2024-03-01)


### Features

* use swc 'resolveFully' to re-impl dir index imports ([61dcda5](https://github.com/Nerdware-LLC/fixit-api/commit/61dcda5ac1959be9dee05766c7f0e1f76d06684c))

# [2.0.0-next.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.24.0-next.1...v2.0.0-next.1) (2024-02-29)


### Features

* convert entire project to 'module:NodeNext' ([73186ee](https://github.com/Nerdware-LLC/fixit-api/commit/73186ee8f4c805da092845a6cf91e3262af05c79))


### BREAKING CHANGES

* that impacts nearly every file in the project. The new
module system facilitates using NodeJS v20 in deployed environments
(staging and prod). Previously, file extensions had been omitted from
import statements, but now they are required. This was made necessary by
node v20 dropping support for the experimental module resolution flag(s)
used in previous node versions (`--experimental-specifier-resolution=node`).
The deployment process will now be much more reliable.
* whole new module import system

# [1.24.0-next.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.23.1...v1.24.0-next.1) (2024-02-28)


### Bug Fixes

* rm file extensions from imports ([74594e8](https://github.com/Nerdware-LLC/fixit-api/commit/74594e84efec7bf2f7e4c44d0abf30ab5d849550))
* **test:** add 'as any' to fake lambda fn names in test ([1828de3](https://github.com/Nerdware-LLC/fixit-api/commit/1828de3ab8a70d3c8b8c25cdba6bfe939ebc76e9))


### Features

* add lambda fn name enum ([3bc9fd8](https://github.com/Nerdware-LLC/fixit-api/commit/3bc9fd80e77d9da03b2fe47c396d2a27ceea3dfb))
* **csp:** update csp directives ([1e2400a](https://github.com/Nerdware-LLC/fixit-api/commit/1e2400ae27bde9b00c3ffe559a3dbeb921097ac9))

## [1.23.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.23.0...v1.23.1) (2024-02-20)


### Bug Fixes

* impl isError util in err-check logic ([79ad8b0](https://github.com/Nerdware-LLC/fixit-api/commit/79ad8b0c53d69988782e46e37b737a111b9d7ff1))

## [1.23.1-next.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.23.0...v1.23.1-next.1) (2024-02-20)


### Bug Fixes

* impl isError util in err-check logic ([79ad8b0](https://github.com/Nerdware-LLC/fixit-api/commit/79ad8b0c53d69988782e46e37b737a111b9d7ff1))

# [1.23.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.22.0...v1.23.0) (2024-02-20)


### Bug Fixes

* add string type check for parseCompoundString arg ([8679b68](https://github.com/Nerdware-LLC/fixit-api/commit/8679b68e99b2d16f43b1deda73216da69ff1a32c))
* call usersCache.get w contactUserID, not userID ([680fb2e](https://github.com/Nerdware-LLC/fixit-api/commit/680fb2eb99cd92c6d46fb5b84e6b5b489404afd9))
* change adminRouter pathing to achieve desired routing ([df7c62e](https://github.com/Nerdware-LLC/fixit-api/commit/df7c62e79459b81f046f76203c28bb63e0f4661b))
* change utils import to logger file not index ([e82fe74](https://github.com/Nerdware-LLC/fixit-api/commit/e82fe74baa0505d866cd3420bbf98fa90b73fa46))
* commit imports of necessary utils ([afdd1a1](https://github.com/Nerdware-LLC/fixit-api/commit/afdd1a1ec59a2f8d7637e348e802fa1eb211131c))
* correct docker:ddb cmd to ddb-start ([26db8cd](https://github.com/Nerdware-LLC/fixit-api/commit/26db8cd64e2810bbdcf3e434237610301b1ac2ff))
* correct logger.warn label to 'WARN' ([8e45e0d](https://github.com/Nerdware-LLC/fixit-api/commit/8e45e0d222a36ec3e9afa405df0eaf96afc81445))
* correct typing to reflect User props ([cd39ae6](https://github.com/Nerdware-LLC/fixit-api/commit/cd39ae60e29abd2e548c5100a6fc9c5cc90bbf13))
* **Dockerfile:** add include=dev flag to 'npm ci' to ensure build tools are present in build stage ([c574f48](https://github.com/Nerdware-LLC/fixit-api/commit/c574f48f25acc2e1fbe189476d5d47682cc94676))
* ensure 'streetLine2' is added in parse method ([d90b79a](https://github.com/Nerdware-LLC/fixit-api/commit/d90b79a0a9895ef6357b348e5e8a071445f9d17d))
* ensure EAVs is only updated for SET clauses ([b0df627](https://github.com/Nerdware-LLC/fixit-api/commit/b0df6279ebcb4e36a4fe861a7e16140ca1bdc8d3))
* ensure error logs are colored in dev ([a3ad5d2](https://github.com/Nerdware-LLC/fixit-api/commit/a3ad5d2b624f33ac7a9fb99086cc52541652ae45))
* ensure NonNullable type excludes all undefined ([bf5ae6c](https://github.com/Nerdware-LLC/fixit-api/commit/bf5ae6c875cdb229882a16982b146165afb4f1ea))
* ensure Sentry does not try to init for test envs ([569df2d](https://github.com/Nerdware-LLC/fixit-api/commit/569df2db8230b3ad114cbf917c7dc057f12897be))
* extract regex-strings into own vars to aid debugging ([be2b9ba](https://github.com/Nerdware-LLC/fixit-api/commit/be2b9ba9cbd6277974b45696a021b1fb424e8615))
* have node_test use 'test:ci' script not 'test' ([116d5ae](https://github.com/Nerdware-LLC/fixit-api/commit/116d5aed2907a258df8f7301d58d89c1fd1bda7f))
* impl 'update' api in mw ([457be80](https://github.com/Nerdware-LLC/fixit-api/commit/457be80569aa9d046ea28c8b9b25b75319365e5a))
* impl model type names ([b2e5f4e](https://github.com/Nerdware-LLC/fixit-api/commit/b2e5f4eda568c6d4c7df32be170b92e4df608bfd))
* **ioHooks:** ensure recursivelyApplyIOHookAction uses fn.call for provided ioAction arg ([e986f67](https://github.com/Nerdware-LLC/fixit-api/commit/e986f677ce6a199d2ed8ba7b0b338bdbdeffd4ba))
* make npm_package_version optional for node starts ([6d11c4d](https://github.com/Nerdware-LLC/fixit-api/commit/6d11c4ddb01301bee8a48889ab766e20b9abd885))
* replace createOne w createItem ([1bbd89a](https://github.com/Nerdware-LLC/fixit-api/commit/1bbd89a72f29ca65679cfc68d895195c266d7657))
* replace dep'd query method w where conditional ([6658ff0](https://github.com/Nerdware-LLC/fixit-api/commit/6658ff02e41858325e66757b25a7ce1cb4d2fc38))
* replace dep'd query method w where conditional ([6b9dc3e](https://github.com/Nerdware-LLC/fixit-api/commit/6b9dc3e4acc4c81ae0272f03839ec2e385e96c23))
* replace triple-slash ref w explicit type import ([d35e582](https://github.com/Nerdware-LLC/fixit-api/commit/d35e582c4ee97d0d89ca4a445acf6b84d824760c))
* replace unix-timestamp regex w UUID regex ([dcbf77b](https://github.com/Nerdware-LLC/fixit-api/commit/dcbf77b02403ba6afee39ac7aac35921a1a03e6b))
* replace unix-timestamp regex with UUID regex ([a8708b4](https://github.com/Nerdware-LLC/fixit-api/commit/a8708b4040cbdb5f8e1c987ff52312a2b5f2bd61))
* replace UUID w unix TS in sub sk ([1cc2331](https://github.com/Nerdware-LLC/fixit-api/commit/1cc23319e7493ed9789a96f8d95a55388d6ba92c))
* replace WO.createOne w createItem ([f88577a](https://github.com/Nerdware-LLC/fixit-api/commit/f88577a84f63cbab9a485fd33922c9d88618d158))
* replace workOrder w workOrderID in invoices mapping ([f9bee00](https://github.com/Nerdware-LLC/fixit-api/commit/f9bee002debf0fbbe92096034d4f14d81c6d6add))
* rm dep'd queryUserSubs method w where conditional query ([69ef0d6](https://github.com/Nerdware-LLC/fixit-api/commit/69ef0d6baebb821d0a8415968848d7b357a52a73))
* rm duplicative proc error logging ([921194e](https://github.com/Nerdware-LLC/fixit-api/commit/921194ed872eb6c91dfb34c3bfc27ee61a31f4fe))
* rm export of Model-regex from Model dirs ([7bfd9de](https://github.com/Nerdware-LLC/fixit-api/commit/7bfd9de2e0e098b942dbc6aa184b150459d308ff))
* rm rest arg for schemaOpts ([184b89f](https://github.com/Nerdware-LLC/fixit-api/commit/184b89fcd5fa8b9b225ea2f16b0f48ffcf4cef3e))
* rm setPrototypeOf calls, set Err names to readonly ([13f738a](https://github.com/Nerdware-LLC/fixit-api/commit/13f738a8db9471d9ac4837bd70d50fc8f106b408))
* rm unnecessary inclusion of 'sk' attr in User.getItem ([036d9f0](https://github.com/Nerdware-LLC/fixit-api/commit/036d9f044a9d433fb0c2490c6f6a8b419897532c))
* rm unnecessary init of 'ENV' obj ([e66bfa4](https://github.com/Nerdware-LLC/fixit-api/commit/e66bfa498b041b925cd23ced12de9e36b7da055b))
* **test:** add VITE_ prefix to test-workflow env-vars ([7705ff6](https://github.com/Nerdware-LLC/fixit-api/commit/7705ff6a621f31eb8576e2063dcde62ac1ef5035))
* update AliasedItemPKs to ensure keys w defaults are optional ([5172d20](https://github.com/Nerdware-LLC/fixit-api/commit/5172d2017bd788a6bf0806786787ab46047485a0))
* update AuthToken type ([5728006](https://github.com/Nerdware-LLC/fixit-api/commit/5728006de50930fa153e7d4fa2be7ee243cc5332))
* update codegen'd gql types ([69b5cd7](https://github.com/Nerdware-LLC/fixit-api/commit/69b5cd7aa8e4463d04ebfaa16e2ecc498ccf5ea5))
* update gql resolvers to use new Model types/methods ([2962ee0](https://github.com/Nerdware-LLC/fixit-api/commit/2962ee0b26f5053d027aaaee752662c4b443e290))
* update import path for ApolloServerResolverContext ([3af7f0d](https://github.com/Nerdware-LLC/fixit-api/commit/3af7f0d3229a23999ddc483b018e211aa3476385))
* update import path for ApolloServerResolverContext ([bc86233](https://github.com/Nerdware-LLC/fixit-api/commit/bc86233df0862a098a5c38dba361b7ffcf622cfe))
* update import path for http-errors ([37e7939](https://github.com/Nerdware-LLC/fixit-api/commit/37e79398d2124bcc63b028859fb6f2f2f1be8863))
* update import path for InternalServerError ([1dbd76f](https://github.com/Nerdware-LLC/fixit-api/commit/1dbd76f1951cbeefdc12db2e76ffc0c03bb3c080))
* update import path for resolver ctx ([2bcaa96](https://github.com/Nerdware-LLC/fixit-api/commit/2bcaa96022ca409d1f75e6c47802f8118b1b7b2a))
* update import path for UserInputError ([94d27e6](https://github.com/Nerdware-LLC/fixit-api/commit/94d27e645d635b32382133ab7401a7529f83a6fb))
* update import path of eventEmitter ([8556a16](https://github.com/Nerdware-LLC/fixit-api/commit/8556a164d55360dfa77aa6658dda7cf03341b96c))
* update import path of httpErrors ([cea6861](https://github.com/Nerdware-LLC/fixit-api/commit/cea68615bc1eba2915e49428c0f761ce807806bf))
* update import paths for Model regex ([e6e3fce](https://github.com/Nerdware-LLC/fixit-api/commit/e6e3fceb3c05dcc118271e9e79c3d4195b8f65e2))
* update isRecordObject logic ([3cce447](https://github.com/Nerdware-LLC/fixit-api/commit/3cce447ebba0a466cb68097e8f2df3c7f26b6242))
* update method name to 'getDisplayName' ([683e410](https://github.com/Nerdware-LLC/fixit-api/commit/683e4106fab01acfd84f2aed3708cb8db48af812))
* update mock pw values to reflect special char reqs ([ac3237a](https://github.com/Nerdware-LLC/fixit-api/commit/ac3237a471956bba3b5edc6214cb46831771fe94))
* update mw to reflect model changes ([6c97cf8](https://github.com/Nerdware-LLC/fixit-api/commit/6c97cf8d6376ac791db39881afe3d67f53e2df92))
* update name of normalize util ([d3f5419](https://github.com/Nerdware-LLC/fixit-api/commit/d3f5419f35227fe9fc9571d49b78877a92785a1c))
* update path aliases to reflect @/* changes ([69a1cb8](https://github.com/Nerdware-LLC/fixit-api/commit/69a1cb874103dd8c398635d409a718433d0c5372))
* update path to contextType ([15eaa8f](https://github.com/Nerdware-LLC/fixit-api/commit/15eaa8fc9bf3a4c54cd57d1e5272ef1273ff21e7))
* update path to resolver ctx type ([3889365](https://github.com/Nerdware-LLC/fixit-api/commit/38893659fbed49366c0143aa89ae7fc1274ddab9))
* update regex import path ([11ff1f5](https://github.com/Nerdware-LLC/fixit-api/commit/11ff1f511d1df06353404c8bc8006f9bbb7ce335))
* update table import to 'ddbTable' ([6294296](https://github.com/Nerdware-LLC/fixit-api/commit/629429602212cddca849bfeb798f13556d95c16a))
* update type exports ([63f4990](https://github.com/Nerdware-LLC/fixit-api/commit/63f4990d8aeb14efa4cd8eba00cd410e92253757))
* use typeof check in validateItem ([4779478](https://github.com/Nerdware-LLC/fixit-api/commit/47794782bd24c7aedcd49d57a03e507779236f01))
* wrap schema in getModelSchema ([7634714](https://github.com/Nerdware-LLC/fixit-api/commit/76347145b778bcbc5d5c42148be13a3add10b837))
* wrap schema in getModelSchema ([5e3764f](https://github.com/Nerdware-LLC/fixit-api/commit/5e3764fb7c744300cac7d399386d5a6324eeba1b))
* wrap schema in getModelSchema ([0c7a7f2](https://github.com/Nerdware-LLC/fixit-api/commit/0c7a7f28ae84636a180366071375fc4089f9e96b))
* wrap schema in getModelSchema ([4371ec4](https://github.com/Nerdware-LLC/fixit-api/commit/4371ec41f003693038922ce769269f549d42f0c7))
* wrap schema in getModelSchema, rm dep'd methods ([55890db](https://github.com/Nerdware-LLC/fixit-api/commit/55890db708df6a5aeb88a34a3dec383af7205ff1))
* wrap schema in getModelSchema, rm dep'd methods ([605acc0](https://github.com/Nerdware-LLC/fixit-api/commit/605acc011dc1a70af6c3487ec3b8a19e543a30a4))


### Features

* add 'isValidID' method to avoid regex imports ([4b59497](https://github.com/Nerdware-LLC/fixit-api/commit/4b59497e33d972709637f6a7f35a67b9784fada9))
* add 'isValidID' methods and allow createdBy/assignedTo schemaOpts ([0f9beea](https://github.com/Nerdware-LLC/fixit-api/commit/0f9beeaaee8f15ef974063062e1a16b5b5765b05))
* add 'processKeyArgs' for streamlined key-args handling ([6e23ffb](https://github.com/Nerdware-LLC/fixit-api/commit/6e23ffb7f52b7e8ff6909a7ecd6d4132951044b7))
* add 'toBeValidDate' asymmetric matcher ([3a3de9d](https://github.com/Nerdware-LLC/fixit-api/commit/3a3de9d0854b484a4578aea322afac0cfc9798cc))
* add 'tuple' attribute type ([8cd1c99](https://github.com/Nerdware-LLC/fixit-api/commit/8cd1c996e93bcd958be83e7e8c11d4615841c880))
* add 'tuple' to isType util ([3f02698](https://github.com/Nerdware-LLC/fixit-api/commit/3f0269855f6ac1626efbf3d40493b23bbb95ea13))
* add arg validation and jsdoc ([ffb5083](https://github.com/Nerdware-LLC/fixit-api/commit/ffb50831d851fd3626b8c7bb180120571f9c524c))
* add arg validation in Location ctor ([d1c88d3](https://github.com/Nerdware-LLC/fixit-api/commit/d1c88d36615d6836c0b34ab2c77ca01be00dc0fd))
* add body parsing (rm'd from expressApp) ([1c6209f](https://github.com/Nerdware-LLC/fixit-api/commit/1c6209f16bc5b41464dda59b61fe2219b7f55cc2))
* add check to ensure attrName is provided ([7b5fb8a](https://github.com/Nerdware-LLC/fixit-api/commit/7b5fb8a3e49a11df47f6efad3b5af5bd168cf6d1))
* add client-input sanitization+validation utils ([1f046bf](https://github.com/Nerdware-LLC/fixit-api/commit/1f046bf3ef42f5df533f8f609e503f49e13bb051))
* add codegen'd file to prettierignore ([e4fa577](https://github.com/Nerdware-LLC/fixit-api/commit/e4fa577a0939076fc6a23c0eac39b607383ea23c))
* add condition to Sentry init ([b80a118](https://github.com/Nerdware-LLC/fixit-api/commit/b80a1188f6214ab0de996668ec48651aaf178a43))
* add createIfNotExists configs ([8cbf3f8](https://github.com/Nerdware-LLC/fixit-api/commit/8cbf3f861460396452f49857c7bb933a13a49f58))
* add err msg for missing user SCA ([96f7882](https://github.com/Nerdware-LLC/fixit-api/commit/96f7882461fa9ab58d4e2b8f106667c0498a9072))
* add err-msg helper fns ([32d3671](https://github.com/Nerdware-LLC/fixit-api/commit/32d3671876de01a6fdbdceafa0a2469967999e75))
* add err.name checks for better jwt decode errors ([d33dd2f](https://github.com/Nerdware-LLC/fixit-api/commit/d33dd2fc13a3134cc893507fdf5f0c9a9d4954ea))
* add ErrorClass param to allow any error type ([5a2c317](https://github.com/Nerdware-LLC/fixit-api/commit/5a2c317aa909d195ea6cd050ea2575962ca64ba0))
* add explicit aws creds for ddb-local in dev ([b0b8636](https://github.com/Nerdware-LLC/fixit-api/commit/b0b86367807f373f09d8d9fabfc869f74312b266))
* add export of Stripe-related 'types' ([f351021](https://github.com/Nerdware-LLC/fixit-api/commit/f351021c06b291b1ede547b2d183f29dc781e5eb))
* add FixitUserCodegenInterface for codegen-config ([844186e](https://github.com/Nerdware-LLC/fixit-api/commit/844186ef9c9330945be7d62d9a966208ed724c0d))
* add fmt validation of arg in parseCompoundString ([28ce336](https://github.com/Nerdware-LLC/fixit-api/commit/28ce336837b6d680421bf3aeff8ac87c7493738b))
* add fromDB ISO-date-str handling to convertJsTypes ([019e6a1](https://github.com/Nerdware-LLC/fixit-api/commit/019e6a18523fe745cdf6ee4872fe92a5bd0b1850))
* add getErrorMessage fn ([fd448e6](https://github.com/Nerdware-LLC/fixit-api/commit/fd448e681c6aac724ae20fa84212b2e7c9523c1a))
* add hasKeys to allow multiple key-checks ([c3882cf](https://github.com/Nerdware-LLC/fixit-api/commit/c3882cfc109ca0112e948d45791736b01c8ab157))
* add helpers to all Models for attr formatting+validation ([71ac205](https://github.com/Nerdware-LLC/fixit-api/commit/71ac20504c5b97e223966dfb12ff98c4a8244533))
* add isSKofType bool methods ([9a2588e](https://github.com/Nerdware-LLC/fixit-api/commit/9a2588e2e535a8f7f150927f3feb87804cd6a737))
* add isValidStripeID stripe util methods ([6670656](https://github.com/Nerdware-LLC/fixit-api/commit/6670656e7e8779f4f825f236c57c033ab59d0ed9))
* add JSON parsing for returned _invoke payload ([ccd40b0](https://github.com/Nerdware-LLC/fixit-api/commit/ccd40b0a21ef47b3894372e0116ef5954349b7f4))
* add methods to make Cache more flexible ([6638922](https://github.com/Nerdware-LLC/fixit-api/commit/6638922e301db7b2c839a6c63cc258d32a3c5be7))
* add ModelSchema validation ([28f6c18](https://github.com/Nerdware-LLC/fixit-api/commit/28f6c1839e116352fe2bdee777c008afca08bfad))
* add new caches and utils ([e0b54eb](https://github.com/Nerdware-LLC/fixit-api/commit/e0b54eb385c92b741de13b29c5e8496b3c0c29a5))
* add new location for codegen'd files ([880bed2](https://github.com/Nerdware-LLC/fixit-api/commit/880bed2f8f316d79b4e3acb4ad66380a022470b4))
* add NonNullableLocation ([9d8ca08](https://github.com/Nerdware-LLC/fixit-api/commit/9d8ca084e99c135f6efb059988f5b3b6aca48a75))
* add open-api processed types ([d8b3e2d](https://github.com/Nerdware-LLC/fixit-api/commit/d8b3e2d31d143b2975b6a8f09406dd3a1c06e3a3))
* add remaining customer-portal events ([9e88397](https://github.com/Nerdware-LLC/fixit-api/commit/9e88397c0d73002855875ec79f851cedffc2a92e))
* add res.locals typings ([cb50fdf](https://github.com/Nerdware-LLC/fixit-api/commit/cb50fdf61b29c544b3d37c4a19ff1649c4a3aca3))
* add sanitizeAndValidateRequestBody and schema ([7ecc494](https://github.com/Nerdware-LLC/fixit-api/commit/7ecc49404959ce349f6d16e140e189df80844d6d))
* add sendRESTJsonResponse mw ([1e32530](https://github.com/Nerdware-LLC/fixit-api/commit/1e325307922882dcf0d384d0e030cc9484cef532))
* add sendWelcomeEmail event handler ([01e4897](https://github.com/Nerdware-LLC/fixit-api/commit/01e48976e69618a931501a081698ce4418d0cb0e))
* add shouldValidateItem so updateItem can disable it ([afe57cc](https://github.com/Nerdware-LLC/fixit-api/commit/afe57cce4d894ff6b322fd97ab09b0cf695b5062))
* add sorted 'schemaEntries' to Model+IO-Actions ([341f661](https://github.com/Nerdware-LLC/fixit-api/commit/341f661aac0cfacd95f7701870a2b3b07915623c))
* add Stripe-related types ([fb6a1b0](https://github.com/Nerdware-LLC/fixit-api/commit/fb6a1b0d40796b5dfecc59ed977e7d201c4589c8))
* add types function,bigint,symbol,undefined,null ([1c929ad](https://github.com/Nerdware-LLC/fixit-api/commit/1c929ad0a56840cc1bf5b9e1798b49b1ad5cfd17))
* add validation of tableConfigs ([f3062a5](https://github.com/Nerdware-LLC/fixit-api/commit/f3062a5f368c9705e4e79c52749047cedc7290fa))
* add Vitest globalSetup and setupTests files ([e255073](https://github.com/Nerdware-LLC/fixit-api/commit/e255073491faf726550eba7880833d5231b34386))
* change 'UpdateChecklistItemInput' 'id' to be nullable ([38606b2](https://github.com/Nerdware-LLC/fixit-api/commit/38606b2c17a955e53066d1f850386a82ba730f8b))
* **DdbST:** add DdbConnectionError for ECONNREFUSED ([8ec3f13](https://github.com/Nerdware-LLC/fixit-api/commit/8ec3f136ee036b6c37f48597b9f0012004680371))
* **DdbST:** add schema opt 'autoAddCreatedAt' ([d8fba66](https://github.com/Nerdware-LLC/fixit-api/commit/d8fba6677d0dc54cee58bafe2c49eac8912dfd38))
* **ddbST:** allow 'allowUnknownAttributes' to be array of strings for transformItem ([126093f](https://github.com/Nerdware-LLC/fixit-api/commit/126093f9b8b3098dcc3eec1a8db62ca9e5442346))
* extract Intl API objects into separate file ([81f20c2](https://github.com/Nerdware-LLC/fixit-api/commit/81f20c2e13bd74592cb1fcdc2b4a2727512e87e8))
* extract Inv enumConstants into own file ([7a74f37](https://github.com/Nerdware-LLC/fixit-api/commit/7a74f3727ac967d23000d80999faec1a06c1c424))
* impl makeExecutableSchema ([868f866](https://github.com/Nerdware-LLC/fixit-api/commit/868f866e8dd7f49a1237c366aa620c267280e141))
* mv ApolloServer init logic to fn for env-based configurability ([546aaf3](https://github.com/Nerdware-LLC/fixit-api/commit/546aaf3587121a19fc3c17a91814941312a211b1))
* replace getRequestBodyValidatorMW with sanitizeAndValidateRequestBody ([c33f315](https://github.com/Nerdware-LLC/fixit-api/commit/c33f31501861e14966ef393d5cd09526a414d516))
* replace momentjs with dayjs ([c813aee](https://github.com/Nerdware-LLC/fixit-api/commit/c813aee3d4134bd717678fad1e49bbae93154608))
* replace old req.body mw w sanitizeAndValidateRequestBody ([b8652e0](https://github.com/Nerdware-LLC/fixit-api/commit/b8652e03cd42e5f8fdab745e4885a49626961140))
* replace Stripe env-vars w caches for StripeAPI objects ([7af7c6e](https://github.com/Nerdware-LLC/fixit-api/commit/7af7c6e4ce61122c33a2962186930c042e4c5fa4))
* rm manual GQL mocks ([91d487d](https://github.com/Nerdware-LLC/fixit-api/commit/91d487d2f91e3ad01d18fad78be0df1e3d51bf5a))
* rm ModelName from err msg so fn doesnt require the param ([ff56650](https://github.com/Nerdware-LLC/fixit-api/commit/ff56650531c3f5e5951bf0e35dc4d64f578619d8))
* rm old env-vars, add JSON.parse overloads for correct behavior ([51e8365](https://github.com/Nerdware-LLC/fixit-api/commit/51e83653e51b5365f8ccf07b86af834208e63cdd))
* rm old WO.createOne method file ([8b1cec6](https://github.com/Nerdware-LLC/fixit-api/commit/8b1cec6e3ff0bf85a011425cd0362022a5fce0d4))
* rm optionality of 'stripeConnectAccount' obj ([d90ba88](https://github.com/Nerdware-LLC/fixit-api/commit/d90ba88c5935d081241acbec855bfcb11f94a2a1))
* rm unused dateTime constants ([df76dd0](https://github.com/Nerdware-LLC/fixit-api/commit/df76dd06c4e989b54690064dc4cf38bb24cc67c0))
* rm unused vitest bench cmd ([0a47b20](https://github.com/Nerdware-LLC/fixit-api/commit/0a47b2064dd629b0fe77d4bca8f4444a862c8c1d))
* streamline mergeModelSchema and related types ([21866b6](https://github.com/Nerdware-LLC/fixit-api/commit/21866b63170f549fe60d0aa7de4cd4b5fd63020d))
* **tests:** add scripts to run stripe-mock docker img for testing ([a5c9f0a](https://github.com/Nerdware-LLC/fixit-api/commit/a5c9f0a2ff49af325aea364aa2dda3986ce83a61))
* **tests:** add vi.mock calls for aws-sdk pkgs ([054e768](https://github.com/Nerdware-LLC/fixit-api/commit/054e7684bf62944af2022f70d51391192427eda1))
* **tests:** replace Jest with Vitest ([a34dbcf](https://github.com/Nerdware-LLC/fixit-api/commit/a34dbcf4c91e98fa41cc722a1414191927074026))
* update 'Location.country' to be non-nullable ([d034e0a](https://github.com/Nerdware-LLC/fixit-api/commit/d034e0a076c2749ebee9b55fe168750cb942bc93))
* update base img to node v20.11.0 ([ef89f12](https://github.com/Nerdware-LLC/fixit-api/commit/ef89f1272fae96fee083595e8ee2b812435239c8))
* update env vars for vitest + ci operability ([0955f7d](https://github.com/Nerdware-LLC/fixit-api/commit/0955f7dd5597c16ba714ca40650872b0bd6d7779))
* update models/_common exports ([3e3de3a](https://github.com/Nerdware-LLC/fixit-api/commit/3e3de3a1b961dfdcaeb927e2e726dd8b74a8e485))
* update mw to use new res.locals, impl open-api req types ([d2277b4](https://github.com/Nerdware-LLC/fixit-api/commit/d2277b45429b8b115917b986e70f78dd9f90bf1c))
* update routers w new mw and open-api types ([5d064ef](https://github.com/Nerdware-LLC/fixit-api/commit/5d064efab67ab2e7a9501725721f07fd32444bfb))
* update utils exports ([70b9683](https://github.com/Nerdware-LLC/fixit-api/commit/70b9683756eaf2ce10bf65a6c4d453ec6a01ac4f))
* update+add mock Stripe obj fns ([7d3ca6d](https://github.com/Nerdware-LLC/fixit-api/commit/7d3ca6d21668d688946f0652a512d105ba177809))


### Performance Improvements

* impl AliasedKeyArgs type param ([0021153](https://github.com/Nerdware-LLC/fixit-api/commit/0021153b96a95fe16cb6ab62742e47d90dc9cd16))
* update engines.node to v18+ ([8f4cc2d](https://github.com/Nerdware-LLC/fixit-api/commit/8f4cc2dcb237db23add2f80dd4bb0992b6fff9f9))

# [1.23.0-next.4](https://github.com/Nerdware-LLC/fixit-api/compare/v1.23.0-next.3...v1.23.0-next.4) (2024-02-20)


### Bug Fixes

* change utils import to logger file not index ([e82fe74](https://github.com/Nerdware-LLC/fixit-api/commit/e82fe74baa0505d866cd3420bbf98fa90b73fa46))
* commit imports of necessary utils ([afdd1a1](https://github.com/Nerdware-LLC/fixit-api/commit/afdd1a1ec59a2f8d7637e348e802fa1eb211131c))
* correct logger.warn label to 'WARN' ([8e45e0d](https://github.com/Nerdware-LLC/fixit-api/commit/8e45e0d222a36ec3e9afa405df0eaf96afc81445))
* correct typing to reflect User props ([cd39ae6](https://github.com/Nerdware-LLC/fixit-api/commit/cd39ae60e29abd2e548c5100a6fc9c5cc90bbf13))
* ensure 'streetLine2' is added in parse method ([d90b79a](https://github.com/Nerdware-LLC/fixit-api/commit/d90b79a0a9895ef6357b348e5e8a071445f9d17d))
* ensure NonNullable type excludes all undefined ([bf5ae6c](https://github.com/Nerdware-LLC/fixit-api/commit/bf5ae6c875cdb229882a16982b146165afb4f1ea))
* impl 'update' api in mw ([457be80](https://github.com/Nerdware-LLC/fixit-api/commit/457be80569aa9d046ea28c8b9b25b75319365e5a))
* impl model type names ([b2e5f4e](https://github.com/Nerdware-LLC/fixit-api/commit/b2e5f4eda568c6d4c7df32be170b92e4df608bfd))
* update gql resolvers to use new Model types/methods ([2962ee0](https://github.com/Nerdware-LLC/fixit-api/commit/2962ee0b26f5053d027aaaee752662c4b443e290))
* update isRecordObject logic ([3cce447](https://github.com/Nerdware-LLC/fixit-api/commit/3cce447ebba0a466cb68097e8f2df3c7f26b6242))
* update mw to reflect model changes ([6c97cf8](https://github.com/Nerdware-LLC/fixit-api/commit/6c97cf8d6376ac791db39881afe3d67f53e2df92))
* update table import to 'ddbTable' ([6294296](https://github.com/Nerdware-LLC/fixit-api/commit/629429602212cddca849bfeb798f13556d95c16a))


### Features

* add 'toBeValidDate' asymmetric matcher ([3a3de9d](https://github.com/Nerdware-LLC/fixit-api/commit/3a3de9d0854b484a4578aea322afac0cfc9798cc))
* add condition to Sentry init ([b80a118](https://github.com/Nerdware-LLC/fixit-api/commit/b80a1188f6214ab0de996668ec48651aaf178a43))
* add createIfNotExists configs ([8cbf3f8](https://github.com/Nerdware-LLC/fixit-api/commit/8cbf3f861460396452f49857c7bb933a13a49f58))
* add export of Stripe-related 'types' ([f351021](https://github.com/Nerdware-LLC/fixit-api/commit/f351021c06b291b1ede547b2d183f29dc781e5eb))
* add FixitUserCodegenInterface for codegen-config ([844186e](https://github.com/Nerdware-LLC/fixit-api/commit/844186ef9c9330945be7d62d9a966208ed724c0d))
* add methods to make Cache more flexible ([6638922](https://github.com/Nerdware-LLC/fixit-api/commit/6638922e301db7b2c839a6c63cc258d32a3c5be7))
* add new caches and utils ([e0b54eb](https://github.com/Nerdware-LLC/fixit-api/commit/e0b54eb385c92b741de13b29c5e8496b3c0c29a5))
* add new location for codegen'd files ([880bed2](https://github.com/Nerdware-LLC/fixit-api/commit/880bed2f8f316d79b4e3acb4ad66380a022470b4))
* add NonNullableLocation ([9d8ca08](https://github.com/Nerdware-LLC/fixit-api/commit/9d8ca084e99c135f6efb059988f5b3b6aca48a75))
* add open-api processed types ([d8b3e2d](https://github.com/Nerdware-LLC/fixit-api/commit/d8b3e2d31d143b2975b6a8f09406dd3a1c06e3a3))
* add res.locals typings ([cb50fdf](https://github.com/Nerdware-LLC/fixit-api/commit/cb50fdf61b29c544b3d37c4a19ff1649c4a3aca3))
* add sendRESTJsonResponse mw ([1e32530](https://github.com/Nerdware-LLC/fixit-api/commit/1e325307922882dcf0d384d0e030cc9484cef532))
* add Stripe-related types ([fb6a1b0](https://github.com/Nerdware-LLC/fixit-api/commit/fb6a1b0d40796b5dfecc59ed977e7d201c4589c8))
* change 'UpdateChecklistItemInput' 'id' to be nullable ([38606b2](https://github.com/Nerdware-LLC/fixit-api/commit/38606b2c17a955e53066d1f850386a82ba730f8b))
* replace Stripe env-vars w caches for StripeAPI objects ([7af7c6e](https://github.com/Nerdware-LLC/fixit-api/commit/7af7c6e4ce61122c33a2962186930c042e4c5fa4))
* rm old env-vars, add JSON.parse overloads for correct behavior ([51e8365](https://github.com/Nerdware-LLC/fixit-api/commit/51e83653e51b5365f8ccf07b86af834208e63cdd))
* rm optionality of 'stripeConnectAccount' obj ([d90ba88](https://github.com/Nerdware-LLC/fixit-api/commit/d90ba88c5935d081241acbec855bfcb11f94a2a1))
* update 'Location.country' to be non-nullable ([d034e0a](https://github.com/Nerdware-LLC/fixit-api/commit/d034e0a076c2749ebee9b55fe168750cb942bc93))
* update base img to node v20.11.0 ([ef89f12](https://github.com/Nerdware-LLC/fixit-api/commit/ef89f1272fae96fee083595e8ee2b812435239c8))
* update mw to use new res.locals, impl open-api req types ([d2277b4](https://github.com/Nerdware-LLC/fixit-api/commit/d2277b45429b8b115917b986e70f78dd9f90bf1c))
* update routers w new mw and open-api types ([5d064ef](https://github.com/Nerdware-LLC/fixit-api/commit/5d064efab67ab2e7a9501725721f07fd32444bfb))
* update+add mock Stripe obj fns ([7d3ca6d](https://github.com/Nerdware-LLC/fixit-api/commit/7d3ca6d21668d688946f0652a512d105ba177809))

# [1.23.0-next.3](https://github.com/Nerdware-LLC/fixit-api/compare/v1.23.0-next.2...v1.23.0-next.3) (2023-08-24)


### Bug Fixes

* have node_test use 'test:ci' script not 'test' ([116d5ae](https://github.com/Nerdware-LLC/fixit-api/commit/116d5aed2907a258df8f7301d58d89c1fd1bda7f))
* replace triple-slash ref w explicit type import ([d35e582](https://github.com/Nerdware-LLC/fixit-api/commit/d35e582c4ee97d0d89ca4a445acf6b84d824760c))
* replace UUID w unix TS in sub sk ([1cc2331](https://github.com/Nerdware-LLC/fixit-api/commit/1cc23319e7493ed9789a96f8d95a55388d6ba92c))


### Features

* add remaining customer-portal events ([9e88397](https://github.com/Nerdware-LLC/fixit-api/commit/9e88397c0d73002855875ec79f851cedffc2a92e))


### Performance Improvements

* update engines.node to v18+ ([8f4cc2d](https://github.com/Nerdware-LLC/fixit-api/commit/8f4cc2dcb237db23add2f80dd4bb0992b6fff9f9))

# [1.23.0-next.2](https://github.com/Nerdware-LLC/fixit-api/compare/v1.23.0-next.1...v1.23.0-next.2) (2023-08-23)


### Bug Fixes

* add string type check for parseCompoundString arg ([8679b68](https://github.com/Nerdware-LLC/fixit-api/commit/8679b68e99b2d16f43b1deda73216da69ff1a32c))
* call usersCache.get w contactUserID, not userID ([680fb2e](https://github.com/Nerdware-LLC/fixit-api/commit/680fb2eb99cd92c6d46fb5b84e6b5b489404afd9))
* change adminRouter pathing to achieve desired routing ([df7c62e](https://github.com/Nerdware-LLC/fixit-api/commit/df7c62e79459b81f046f76203c28bb63e0f4661b))
* correct docker:ddb cmd to ddb-start ([26db8cd](https://github.com/Nerdware-LLC/fixit-api/commit/26db8cd64e2810bbdcf3e434237610301b1ac2ff))
* **Dockerfile:** add include=dev flag to 'npm ci' to ensure build tools are present in build stage ([c574f48](https://github.com/Nerdware-LLC/fixit-api/commit/c574f48f25acc2e1fbe189476d5d47682cc94676))
* ensure error logs are colored in dev ([a3ad5d2](https://github.com/Nerdware-LLC/fixit-api/commit/a3ad5d2b624f33ac7a9fb99086cc52541652ae45))
* make npm_package_version optional for node starts ([6d11c4d](https://github.com/Nerdware-LLC/fixit-api/commit/6d11c4ddb01301bee8a48889ab766e20b9abd885))
* replace unix-timestamp regex w UUID regex ([dcbf77b](https://github.com/Nerdware-LLC/fixit-api/commit/dcbf77b02403ba6afee39ac7aac35921a1a03e6b))
* replace unix-timestamp regex with UUID regex ([a8708b4](https://github.com/Nerdware-LLC/fixit-api/commit/a8708b4040cbdb5f8e1c987ff52312a2b5f2bd61))
* replace workOrder w workOrderID in invoices mapping ([f9bee00](https://github.com/Nerdware-LLC/fixit-api/commit/f9bee002debf0fbbe92096034d4f14d81c6d6add))
* rm duplicative proc error logging ([921194e](https://github.com/Nerdware-LLC/fixit-api/commit/921194ed872eb6c91dfb34c3bfc27ee61a31f4fe))
* rm rest arg for schemaOpts ([184b89f](https://github.com/Nerdware-LLC/fixit-api/commit/184b89fcd5fa8b9b225ea2f16b0f48ffcf4cef3e))
* rm setPrototypeOf calls, set Err names to readonly ([13f738a](https://github.com/Nerdware-LLC/fixit-api/commit/13f738a8db9471d9ac4837bd70d50fc8f106b408))
* **test:** add VITE_ prefix to test-workflow env-vars ([7705ff6](https://github.com/Nerdware-LLC/fixit-api/commit/7705ff6a621f31eb8576e2063dcde62ac1ef5035))
* update AuthToken type ([5728006](https://github.com/Nerdware-LLC/fixit-api/commit/5728006de50930fa153e7d4fa2be7ee243cc5332))
* update codegen'd gql types ([69b5cd7](https://github.com/Nerdware-LLC/fixit-api/commit/69b5cd7aa8e4463d04ebfaa16e2ecc498ccf5ea5))
* update import path for http-errors ([37e7939](https://github.com/Nerdware-LLC/fixit-api/commit/37e79398d2124bcc63b028859fb6f2f2f1be8863))
* update import path for InternalServerError ([1dbd76f](https://github.com/Nerdware-LLC/fixit-api/commit/1dbd76f1951cbeefdc12db2e76ffc0c03bb3c080))
* update import path for resolver ctx ([2bcaa96](https://github.com/Nerdware-LLC/fixit-api/commit/2bcaa96022ca409d1f75e6c47802f8118b1b7b2a))
* update import path for UserInputError ([94d27e6](https://github.com/Nerdware-LLC/fixit-api/commit/94d27e645d635b32382133ab7401a7529f83a6fb))
* update import path of eventEmitter ([8556a16](https://github.com/Nerdware-LLC/fixit-api/commit/8556a164d55360dfa77aa6658dda7cf03341b96c))
* update import path of httpErrors ([cea6861](https://github.com/Nerdware-LLC/fixit-api/commit/cea68615bc1eba2915e49428c0f761ce807806bf))
* update method name to 'getDisplayName' ([683e410](https://github.com/Nerdware-LLC/fixit-api/commit/683e4106fab01acfd84f2aed3708cb8db48af812))
* update mock pw values to reflect special char reqs ([ac3237a](https://github.com/Nerdware-LLC/fixit-api/commit/ac3237a471956bba3b5edc6214cb46831771fe94))
* update name of normalize util ([d3f5419](https://github.com/Nerdware-LLC/fixit-api/commit/d3f5419f35227fe9fc9571d49b78877a92785a1c))
* update path aliases to reflect @/* changes ([69a1cb8](https://github.com/Nerdware-LLC/fixit-api/commit/69a1cb874103dd8c398635d409a718433d0c5372))
* update path to resolver ctx type ([3889365](https://github.com/Nerdware-LLC/fixit-api/commit/38893659fbed49366c0143aa89ae7fc1274ddab9))
* update type exports ([63f4990](https://github.com/Nerdware-LLC/fixit-api/commit/63f4990d8aeb14efa4cd8eba00cd410e92253757))
* use typeof check in validateItem ([4779478](https://github.com/Nerdware-LLC/fixit-api/commit/47794782bd24c7aedcd49d57a03e507779236f01))


### Features

* add arg validation and jsdoc ([ffb5083](https://github.com/Nerdware-LLC/fixit-api/commit/ffb50831d851fd3626b8c7bb180120571f9c524c))
* add arg validation in Location ctor ([d1c88d3](https://github.com/Nerdware-LLC/fixit-api/commit/d1c88d36615d6836c0b34ab2c77ca01be00dc0fd))
* add body parsing (rm'd from expressApp) ([1c6209f](https://github.com/Nerdware-LLC/fixit-api/commit/1c6209f16bc5b41464dda59b61fe2219b7f55cc2))
* add check to ensure attrName is provided ([7b5fb8a](https://github.com/Nerdware-LLC/fixit-api/commit/7b5fb8a3e49a11df47f6efad3b5af5bd168cf6d1))
* add client-input sanitization+validation utils ([1f046bf](https://github.com/Nerdware-LLC/fixit-api/commit/1f046bf3ef42f5df533f8f609e503f49e13bb051))
* add err msg for missing user SCA ([96f7882](https://github.com/Nerdware-LLC/fixit-api/commit/96f7882461fa9ab58d4e2b8f106667c0498a9072))
* add err.name checks for better jwt decode errors ([d33dd2f](https://github.com/Nerdware-LLC/fixit-api/commit/d33dd2fc13a3134cc893507fdf5f0c9a9d4954ea))
* add ErrorClass param to allow any error type ([5a2c317](https://github.com/Nerdware-LLC/fixit-api/commit/5a2c317aa909d195ea6cd050ea2575962ca64ba0))
* add explicit aws creds for ddb-local in dev ([b0b8636](https://github.com/Nerdware-LLC/fixit-api/commit/b0b86367807f373f09d8d9fabfc869f74312b266))
* add fmt validation of arg in parseCompoundString ([28ce336](https://github.com/Nerdware-LLC/fixit-api/commit/28ce336837b6d680421bf3aeff8ac87c7493738b))
* add fromDB ISO-date-str handling to convertJsTypes ([019e6a1](https://github.com/Nerdware-LLC/fixit-api/commit/019e6a18523fe745cdf6ee4872fe92a5bd0b1850))
* add getErrorMessage fn ([fd448e6](https://github.com/Nerdware-LLC/fixit-api/commit/fd448e681c6aac724ae20fa84212b2e7c9523c1a))
* add hasKeys to allow multiple key-checks ([c3882cf](https://github.com/Nerdware-LLC/fixit-api/commit/c3882cfc109ca0112e948d45791736b01c8ab157))
* add helpers to all Models for attr formatting+validation ([71ac205](https://github.com/Nerdware-LLC/fixit-api/commit/71ac20504c5b97e223966dfb12ff98c4a8244533))
* add isSKofType bool methods ([9a2588e](https://github.com/Nerdware-LLC/fixit-api/commit/9a2588e2e535a8f7f150927f3feb87804cd6a737))
* add isValidStripeID stripe util methods ([6670656](https://github.com/Nerdware-LLC/fixit-api/commit/6670656e7e8779f4f825f236c57c033ab59d0ed9))
* add JSON parsing for returned _invoke payload ([ccd40b0](https://github.com/Nerdware-LLC/fixit-api/commit/ccd40b0a21ef47b3894372e0116ef5954349b7f4))
* add ModelSchema validation ([28f6c18](https://github.com/Nerdware-LLC/fixit-api/commit/28f6c1839e116352fe2bdee777c008afca08bfad))
* add sanitizeAndValidateRequestBody and schema ([7ecc494](https://github.com/Nerdware-LLC/fixit-api/commit/7ecc49404959ce349f6d16e140e189df80844d6d))
* add sendWelcomeEmail event handler ([01e4897](https://github.com/Nerdware-LLC/fixit-api/commit/01e48976e69618a931501a081698ce4418d0cb0e))
* add shouldValidateItem so updateItem can disable it ([afe57cc](https://github.com/Nerdware-LLC/fixit-api/commit/afe57cce4d894ff6b322fd97ab09b0cf695b5062))
* add types function,bigint,symbol,undefined,null ([1c929ad](https://github.com/Nerdware-LLC/fixit-api/commit/1c929ad0a56840cc1bf5b9e1798b49b1ad5cfd17))
* add validation of tableConfigs ([f3062a5](https://github.com/Nerdware-LLC/fixit-api/commit/f3062a5f368c9705e4e79c52749047cedc7290fa))
* **DdbST:** add DdbConnectionError for ECONNREFUSED ([8ec3f13](https://github.com/Nerdware-LLC/fixit-api/commit/8ec3f136ee036b6c37f48597b9f0012004680371))
* **DdbST:** add schema opt 'autoAddCreatedAt' ([d8fba66](https://github.com/Nerdware-LLC/fixit-api/commit/d8fba6677d0dc54cee58bafe2c49eac8912dfd38))
* extract Intl API objects into separate file ([81f20c2](https://github.com/Nerdware-LLC/fixit-api/commit/81f20c2e13bd74592cb1fcdc2b4a2727512e87e8))
* extract Inv enumConstants into own file ([7a74f37](https://github.com/Nerdware-LLC/fixit-api/commit/7a74f3727ac967d23000d80999faec1a06c1c424))
* replace getRequestBodyValidatorMW with sanitizeAndValidateRequestBody ([c33f315](https://github.com/Nerdware-LLC/fixit-api/commit/c33f31501861e14966ef393d5cd09526a414d516))
* replace momentjs with dayjs ([c813aee](https://github.com/Nerdware-LLC/fixit-api/commit/c813aee3d4134bd717678fad1e49bbae93154608))
* replace old req.body mw w sanitizeAndValidateRequestBody ([b8652e0](https://github.com/Nerdware-LLC/fixit-api/commit/b8652e03cd42e5f8fdab745e4885a49626961140))
* rm unused dateTime constants ([df76dd0](https://github.com/Nerdware-LLC/fixit-api/commit/df76dd06c4e989b54690064dc4cf38bb24cc67c0))
* rm unused vitest bench cmd ([0a47b20](https://github.com/Nerdware-LLC/fixit-api/commit/0a47b2064dd629b0fe77d4bca8f4444a862c8c1d))
* **tests:** add vi.mock calls for aws-sdk pkgs ([054e768](https://github.com/Nerdware-LLC/fixit-api/commit/054e7684bf62944af2022f70d51391192427eda1))
* update models/_common exports ([3e3de3a](https://github.com/Nerdware-LLC/fixit-api/commit/3e3de3a1b961dfdcaeb927e2e726dd8b74a8e485))
* update utils exports ([70b9683](https://github.com/Nerdware-LLC/fixit-api/commit/70b9683756eaf2ce10bf65a6c4d453ec6a01ac4f))

# [1.23.0-next.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.22.0...v1.23.0-next.1) (2023-07-17)


### Bug Fixes

* ensure EAVs is only updated for SET clauses ([b0df627](https://github.com/Nerdware-LLC/fixit-api/commit/b0df6279ebcb4e36a4fe861a7e16140ca1bdc8d3))
* ensure Sentry does not try to init for test envs ([569df2d](https://github.com/Nerdware-LLC/fixit-api/commit/569df2db8230b3ad114cbf917c7dc057f12897be))
* extract regex-strings into own vars to aid debugging ([be2b9ba](https://github.com/Nerdware-LLC/fixit-api/commit/be2b9ba9cbd6277974b45696a021b1fb424e8615))
* **ioHooks:** ensure recursivelyApplyIOHookAction uses fn.call for provided ioAction arg ([e986f67](https://github.com/Nerdware-LLC/fixit-api/commit/e986f677ce6a199d2ed8ba7b0b338bdbdeffd4ba))
* replace createOne w createItem ([1bbd89a](https://github.com/Nerdware-LLC/fixit-api/commit/1bbd89a72f29ca65679cfc68d895195c266d7657))
* replace dep'd query method w where conditional ([6658ff0](https://github.com/Nerdware-LLC/fixit-api/commit/6658ff02e41858325e66757b25a7ce1cb4d2fc38))
* replace dep'd query method w where conditional ([6b9dc3e](https://github.com/Nerdware-LLC/fixit-api/commit/6b9dc3e4acc4c81ae0272f03839ec2e385e96c23))
* replace WO.createOne w createItem ([f88577a](https://github.com/Nerdware-LLC/fixit-api/commit/f88577a84f63cbab9a485fd33922c9d88618d158))
* rm dep'd queryUserSubs method w where conditional query ([69ef0d6](https://github.com/Nerdware-LLC/fixit-api/commit/69ef0d6baebb821d0a8415968848d7b357a52a73))
* rm export of Model-regex from Model dirs ([7bfd9de](https://github.com/Nerdware-LLC/fixit-api/commit/7bfd9de2e0e098b942dbc6aa184b150459d308ff))
* rm unnecessary inclusion of 'sk' attr in User.getItem ([036d9f0](https://github.com/Nerdware-LLC/fixit-api/commit/036d9f044a9d433fb0c2490c6f6a8b419897532c))
* rm unnecessary init of 'ENV' obj ([e66bfa4](https://github.com/Nerdware-LLC/fixit-api/commit/e66bfa498b041b925cd23ced12de9e36b7da055b))
* update AliasedItemPKs to ensure keys w defaults are optional ([5172d20](https://github.com/Nerdware-LLC/fixit-api/commit/5172d2017bd788a6bf0806786787ab46047485a0))
* update import path for ApolloServerResolverContext ([3af7f0d](https://github.com/Nerdware-LLC/fixit-api/commit/3af7f0d3229a23999ddc483b018e211aa3476385))
* update import path for ApolloServerResolverContext ([bc86233](https://github.com/Nerdware-LLC/fixit-api/commit/bc86233df0862a098a5c38dba361b7ffcf622cfe))
* update import paths for Model regex ([e6e3fce](https://github.com/Nerdware-LLC/fixit-api/commit/e6e3fceb3c05dcc118271e9e79c3d4195b8f65e2))
* update path to contextType ([15eaa8f](https://github.com/Nerdware-LLC/fixit-api/commit/15eaa8fc9bf3a4c54cd57d1e5272ef1273ff21e7))
* update regex import path ([11ff1f5](https://github.com/Nerdware-LLC/fixit-api/commit/11ff1f511d1df06353404c8bc8006f9bbb7ce335))
* wrap schema in getModelSchema ([7634714](https://github.com/Nerdware-LLC/fixit-api/commit/76347145b778bcbc5d5c42148be13a3add10b837))
* wrap schema in getModelSchema ([5e3764f](https://github.com/Nerdware-LLC/fixit-api/commit/5e3764fb7c744300cac7d399386d5a6324eeba1b))
* wrap schema in getModelSchema ([0c7a7f2](https://github.com/Nerdware-LLC/fixit-api/commit/0c7a7f28ae84636a180366071375fc4089f9e96b))
* wrap schema in getModelSchema ([4371ec4](https://github.com/Nerdware-LLC/fixit-api/commit/4371ec41f003693038922ce769269f549d42f0c7))
* wrap schema in getModelSchema, rm dep'd methods ([55890db](https://github.com/Nerdware-LLC/fixit-api/commit/55890db708df6a5aeb88a34a3dec383af7205ff1))
* wrap schema in getModelSchema, rm dep'd methods ([605acc0](https://github.com/Nerdware-LLC/fixit-api/commit/605acc011dc1a70af6c3487ec3b8a19e543a30a4))


### Features

* add 'isValidID' method to avoid regex imports ([4b59497](https://github.com/Nerdware-LLC/fixit-api/commit/4b59497e33d972709637f6a7f35a67b9784fada9))
* add 'isValidID' methods and allow createdBy/assignedTo schemaOpts ([0f9beea](https://github.com/Nerdware-LLC/fixit-api/commit/0f9beeaaee8f15ef974063062e1a16b5b5765b05))
* add 'processKeyArgs' for streamlined key-args handling ([6e23ffb](https://github.com/Nerdware-LLC/fixit-api/commit/6e23ffb7f52b7e8ff6909a7ecd6d4132951044b7))
* add 'tuple' attribute type ([8cd1c99](https://github.com/Nerdware-LLC/fixit-api/commit/8cd1c996e93bcd958be83e7e8c11d4615841c880))
* add 'tuple' to isType util ([3f02698](https://github.com/Nerdware-LLC/fixit-api/commit/3f0269855f6ac1626efbf3d40493b23bbb95ea13))
* add codegen'd file to prettierignore ([e4fa577](https://github.com/Nerdware-LLC/fixit-api/commit/e4fa577a0939076fc6a23c0eac39b607383ea23c))
* add err-msg helper fns ([32d3671](https://github.com/Nerdware-LLC/fixit-api/commit/32d3671876de01a6fdbdceafa0a2469967999e75))
* add sorted 'schemaEntries' to Model+IO-Actions ([341f661](https://github.com/Nerdware-LLC/fixit-api/commit/341f661aac0cfacd95f7701870a2b3b07915623c))
* add Vitest globalSetup and setupTests files ([e255073](https://github.com/Nerdware-LLC/fixit-api/commit/e255073491faf726550eba7880833d5231b34386))
* **ddbST:** allow 'allowUnknownAttributes' to be array of strings for transformItem ([126093f](https://github.com/Nerdware-LLC/fixit-api/commit/126093f9b8b3098dcc3eec1a8db62ca9e5442346))
* impl makeExecutableSchema ([868f866](https://github.com/Nerdware-LLC/fixit-api/commit/868f866e8dd7f49a1237c366aa620c267280e141))
* mv ApolloServer init logic to fn for env-based configurability ([546aaf3](https://github.com/Nerdware-LLC/fixit-api/commit/546aaf3587121a19fc3c17a91814941312a211b1))
* rm manual GQL mocks ([91d487d](https://github.com/Nerdware-LLC/fixit-api/commit/91d487d2f91e3ad01d18fad78be0df1e3d51bf5a))
* rm ModelName from err msg so fn doesnt require the param ([ff56650](https://github.com/Nerdware-LLC/fixit-api/commit/ff56650531c3f5e5951bf0e35dc4d64f578619d8))
* rm old WO.createOne method file ([8b1cec6](https://github.com/Nerdware-LLC/fixit-api/commit/8b1cec6e3ff0bf85a011425cd0362022a5fce0d4))
* streamline mergeModelSchema and related types ([21866b6](https://github.com/Nerdware-LLC/fixit-api/commit/21866b63170f549fe60d0aa7de4cd4b5fd63020d))
* **tests:** add scripts to run stripe-mock docker img for testing ([a5c9f0a](https://github.com/Nerdware-LLC/fixit-api/commit/a5c9f0a2ff49af325aea364aa2dda3986ce83a61))
* **tests:** replace Jest with Vitest ([a34dbcf](https://github.com/Nerdware-LLC/fixit-api/commit/a34dbcf4c91e98fa41cc722a1414191927074026))
* update env vars for vitest + ci operability ([0955f7d](https://github.com/Nerdware-LLC/fixit-api/commit/0955f7dd5597c16ba714ca40650872b0bd6d7779))


### Performance Improvements

* impl AliasedKeyArgs type param ([0021153](https://github.com/Nerdware-LLC/fixit-api/commit/0021153b96a95fe16cb6ab62742e47d90dc9cd16))

# [1.22.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.21.0...v1.22.0) (2023-07-12)


### Features

* **ci:** add 'dockerfile-path' input to ecr_image_push ([c94a508](https://github.com/Nerdware-LLC/fixit-api/commit/c94a508a1bbc63bb7ec464c1d27273273870d694))
* **ci:** ensure codegen'd files are ignore by pre-commit hooks ([2332247](https://github.com/Nerdware-LLC/fixit-api/commit/2332247a5321267ce5483f629c3d90184797b7b1))
* **ci:** rm PR from events triggering Release Workflow ([3918e94](https://github.com/Nerdware-LLC/fixit-api/commit/3918e94c2ff86b0ad029c5465cf2e44606c92c57))
* **ci:** set engines.node to '>=16.0.0', set explicit node-version in Test Workflow ([d2c102c](https://github.com/Nerdware-LLC/fixit-api/commit/d2c102cdf258587aeb2629f4589e2a5b24e5f705))

# [1.22.0-next.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.21.0...v1.22.0-next.1) (2023-07-09)


### Features

* **ci:** ensure codegen'd files are ignore by pre-commit hooks ([2332247](https://github.com/Nerdware-LLC/fixit-api/commit/2332247a5321267ce5483f629c3d90184797b7b1))
* **ci:** rm PR from events triggering Release Workflow ([3918e94](https://github.com/Nerdware-LLC/fixit-api/commit/3918e94c2ff86b0ad029c5465cf2e44606c92c57))
* **ci:** set engines.node to '>=16.0.0', set explicit node-version in Test Workflow ([d2c102c](https://github.com/Nerdware-LLC/fixit-api/commit/d2c102cdf258587aeb2629f4589e2a5b24e5f705))

# [1.21.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.20.0...v1.21.0) (2023-07-08)

### Features

* add 'jwt-algorithm' to env vars to parameterize algo by env ([6c3056d](https://github.com/Nerdware-LLC/fixit-api/commit/6c3056d2135d47cdc4bdedd6a5ba13745b1b65c7))
* add 'push' event to release workflow ([29a9247](https://github.com/Nerdware-LLC/fixit-api/commit/29a92472c0c5dcb64c9978fc33f0c388d143e36e))
* set engines.node to 16.17.0 ([78db912](https://github.com/Nerdware-LLC/fixit-api/commit/78db9129d4ed6b713b6e67d056ed20de0b6d6924))

# [1.20.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.19.0...v1.20.0) (2023-07-01)

### Features

- add 'jwt-algorithm' to env vars to parameterize algo by env ([6c3056d](https://github.com/Nerdware-LLC/fixit-api/commit/6c3056d2135d47cdc4bdedd6a5ba13745b1b65c7))
- add 'push' event to release workflow ([29a9247](https://github.com/Nerdware-LLC/fixit-api/commit/29a92472c0c5dcb64c9978fc33f0c388d143e36e))
- set engines.node to 16.17.0 ([78db912](https://github.com/Nerdware-LLC/fixit-api/commit/78db9129d4ed6b713b6e67d056ed20de0b6d6924))
- add route '/stripe' to webhooksRouter ([6b0d6d4](https://github.com/Nerdware-LLC/fixit-api/commit/6b0d6d475f9ef0098e75829956b6b448efd48950))

# [1.19.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.18.0...v1.19.0) (2023-06-28)

### Bug Fixes

- ensure coverage is not collected on mock-related files ([bd6682b](https://github.com/Nerdware-LLC/fixit-api/commit/bd6682b6401e6fd024ddd8b156e8f4e8782abe1a))
- get err 'message' property in err-log message ([60b7cdc](https://github.com/Nerdware-LLC/fixit-api/commit/60b7cdca26db4638114b603a8325d3405b1a7133))
- implement new Model types in relevant event handlers ([9a6d338](https://github.com/Nerdware-LLC/fixit-api/commit/9a6d3383a6912687a87f4ee75a36f308693c5af7))
- implement safeJsonStringify ([0131b74](https://github.com/Nerdware-LLC/fixit-api/commit/0131b74c5d9ac4881da0a093c55bd5e1108e8278))
- update to reflect new Model types ([8454a23](https://github.com/Nerdware-LLC/fixit-api/commit/8454a2385ffa9ac2aa82ecbedef3d2b5e73c6338))
- update to reflect new Model types ([36dce95](https://github.com/Nerdware-LLC/fixit-api/commit/36dce9579a14f49cb152621bdd4b98b735fc84f9))
- update to use ddbst instance ([15e48df](https://github.com/Nerdware-LLC/fixit-api/commit/15e48df1ef50e9da9d72059570baf7d95ac33374))
- update to use top-level await ([1accc1a](https://github.com/Nerdware-LLC/fixit-api/commit/1accc1acc81ce19c2acbab95b41b8e662b2cf581))

### Features

- add '\_userSubscription' key to express Request type dec ([20ce133](https://github.com/Nerdware-LLC/fixit-api/commit/20ce1333ac062a2f26d84083cac17d70fe4ac281))
- add 'has' method to Cache class ([bd634c6](https://github.com/Nerdware-LLC/fixit-api/commit/bd634c606a94148be3a838ad02222bcca8c23470))
- add handling for internal jwt fields like 'iss' ([20ca6f7](https://github.com/Nerdware-LLC/fixit-api/commit/20ca6f7a216e655af6b390b6f879ca06359ac816))
- add modded types which fix/improve codegen types like the troublesome Maybe type ([35c0543](https://github.com/Nerdware-LLC/fixit-api/commit/35c05432ba9ff6a8b006e8d8cc1e14c8f455e822))
- add utils hasKey,safeJsonStringify,isType ([d2bd47e](https://github.com/Nerdware-LLC/fixit-api/commit/d2bd47ecb7b199d721dd6a3645c26a7126482f0e))
- **eslint:** add 'ignore' for codegen'd files ([7fe7dab](https://github.com/Nerdware-LLC/fixit-api/commit/7fe7dab30d340e60055153acac2cc3ff3c596987))
- implement new Model types in gql resolvers, add helpers+AuthTokenPayload type ([704dd4c](https://github.com/Nerdware-LLC/fixit-api/commit/704dd4cf0ce61123fbb6d10743ace9446b2ad882))
- implement new Model types, add mw helpers ([360d79c](https://github.com/Nerdware-LLC/fixit-api/commit/360d79c7ef4e9cba9474e932457b11d06a055327))
- overhaul DdbSingleTable ([1fb9072](https://github.com/Nerdware-LLC/fixit-api/commit/1fb9072e5cb4b55cac52a87321326666e5e99b99))
- rm old type-mappings, add scalar-configs ([9ee0498](https://github.com/Nerdware-LLC/fixit-api/commit/9ee049802d649579993e864decda22798c0d886e))
- rm unused 'getKey' util fns ([7b6872e](https://github.com/Nerdware-LLC/fixit-api/commit/7b6872e2ee33a906157bee1f6af326087532d266))
- update GQL schema for API changes ([89b683a](https://github.com/Nerdware-LLC/fixit-api/commit/89b683a92ef49d1c5db2ece2a3e920409619fd4c))
- update index file to reflect utils dir changes ([26d903b](https://github.com/Nerdware-LLC/fixit-api/commit/26d903bb8591d1bf2700e71699a23fe25b761c6b))
- update Models w new DdbSingleTable usage ([5682beb](https://github.com/Nerdware-LLC/fixit-api/commit/5682beb332d27ba01adf5b3e4d9674448be6c57d))

# [1.18.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.17.0...v1.18.0) (2023-05-07)

### Bug Fixes

- **types:** correct DDBST Model method typings ([54b54d1](https://github.com/Nerdware-LLC/fixit-api/commit/54b54d1d7b1fe9142b28c32cc6412d18b251d6d1))

### Features

- add exports of typeSafety/ ([e178857](https://github.com/Nerdware-LLC/fixit-api/commit/e17885722adb9895958276904406934779c999dd))
- add GenericSuccessResponse gql response type ([58de70e](https://github.com/Nerdware-LLC/fixit-api/commit/58de70e4f82139f152c816d96d63ae1b77b6d5fd))
- add init UsersCache side-effect import ([e34143b](https://github.com/Nerdware-LLC/fixit-api/commit/e34143b472b15ec09d64990abf0424a443e6182f))
- add UsersCache to min SearchUsers query RCUs ([efefc98](https://github.com/Nerdware-LLC/fixit-api/commit/efefc98ad186c1f61e0c4122187a26912816f7eb))
- improve phone+email identifying regex patterns ([5897393](https://github.com/Nerdware-LLC/fixit-api/commit/5897393b3c6d68daa2253d5bcb0f6d871dce249e))
- rm unused \*.d.ts files ([00bbe79](https://github.com/Nerdware-LLC/fixit-api/commit/00bbe7905978ea4278204a5033e4be15c7815f7f))
- split scalars into own typedefs+resolvers, add helpers ([f65b93b](https://github.com/Nerdware-LLC/fixit-api/commit/f65b93b13e3896830145f15f80a9ba091f685238))
- update codegen config ([788e29d](https://github.com/Nerdware-LLC/fixit-api/commit/788e29d4f76169cb867efd3287c9372292a2cc7a))
- update codegen'd types to reflect GQL changes ([e6af041](https://github.com/Nerdware-LLC/fixit-api/commit/e6af04121863ba75e8336d0110e4ae0b2cd3c3b8))
- update exports from \_common ([edd1fb5](https://github.com/Nerdware-LLC/fixit-api/commit/edd1fb5d632ac0b800c7e1d95141e49b1f502b77))
- update GQL schema for API changes ([4f33178](https://github.com/Nerdware-LLC/fixit-api/commit/4f33178d0b4dec888666681049cf9c2029ed3101))

# [1.17.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.16.0...v1.17.0) (2022-12-23)

### Bug Fixes

- **gql-sca:** rm SCA, was replaced by UserSCA ([6baa1e2](https://github.com/Nerdware-LLC/fixit-api/commit/6baa1e234a5b4bf849f872cdda0790fb3ee4abe2))
- **queryUserItems:** add nullable-field handling for client-GQL-schema matching ([f2ecbc3](https://github.com/Nerdware-LLC/fixit-api/commit/f2ecbc3938b10ec63b0dfc35eadf53fd41d4fd24))

### Features

- add GQL file used by codegen; update codegen types ([bab1ebe](https://github.com/Nerdware-LLC/fixit-api/commit/bab1ebe4674a01585e4d0459c4089842d9d58028))
- **codegen:** add type-mappings for GQL resolver types ([bff8794](https://github.com/Nerdware-LLC/fixit-api/commit/bff8794daf99ab573aba6677f1d4a43190075a26))
- impl new 'handle' property on User model+types+etc ([6b63e3a](https://github.com/Nerdware-LLC/fixit-api/commit/6b63e3a8f1a124145786b90c46dbc300a79f4811))

# [1.16.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.15.0...v1.16.0) (2022-12-11)

### Bug Fixes

- **events:** rm destructure of possibly undefined value ([4515116](https://github.com/Nerdware-LLC/fixit-api/commit/4515116dde95b268570c37c0b4849f7eac3e4923))
- **wo-location:** replace abstract-interface w concrete gql type ([56da52a](https://github.com/Nerdware-LLC/fixit-api/commit/56da52ad49aa475be9cb88f49e282de0664ba521))

### Features

- **AuthToken:** add 'profile' to auth token fields ([a58be2a](https://github.com/Nerdware-LLC/fixit-api/commit/a58be2a63ce0da188d2219a9615dc89e2e481e78))
- **cors:** add headers for Apollo-Studio introspection in dev env ([7582f5b](https://github.com/Nerdware-LLC/fixit-api/commit/7582f5b2a1f26f30340c100feeee6cedb8cc6029))
- **env:** add APOLLO_STUDIO_INTROSPECTION_AUTH_TOKEN ([3e0c557](https://github.com/Nerdware-LLC/fixit-api/commit/3e0c557e076f560232258180fd603ac667c51b2e))
- **env:** add APOLLO_STUDIO_INTROSPECTION_AUTH_TOKEN ([068aa2e](https://github.com/Nerdware-LLC/fixit-api/commit/068aa2e51c7828ee4a40b0fc57de02dff8f212e9))
- **errors:** add static field for status code nums ([4cf1d58](https://github.com/Nerdware-LLC/fixit-api/commit/4cf1d5815494c037d86cf94bb2f80325a42e1589))
- **fixitUser:** add 'profile' to interface ([8210952](https://github.com/Nerdware-LLC/fixit-api/commit/821095229e106bc465dfac358001f1c21a365ef4))
- **gql-introspection:** correct isIntrospectionQuery logic ([784eb35](https://github.com/Nerdware-LLC/fixit-api/commit/784eb3596811ab5384f175dd3c583a512d4c4c06))
- **gql-profile:** rm field 'profile.id' ([fbdab9a](https://github.com/Nerdware-LLC/fixit-api/commit/fbdab9a678cf5fb0c65cd395e5076274b8b6caac))
- **gql-resolvers:** convert to TS with codegen typings ([39aa52a](https://github.com/Nerdware-LLC/fixit-api/commit/39aa52a2902ea4cb490104a8ffab13ae7e7b9e74))
- **gql-user:** rename gql-type SCA to UserSCA ([70f58a0](https://github.com/Nerdware-LLC/fixit-api/commit/70f58a0c85a33610ac2e755a25be881616c3518b))
- **myInvoices:** correct return type to separate own/assigned invoices ([10756cd](https://github.com/Nerdware-LLC/fixit-api/commit/10756cd6115e095811d472dd58e77bae7fa9272e))
- **userSCA:** add typedefs to schema file ([df8fb7e](https://github.com/Nerdware-LLC/fixit-api/commit/df8fb7ef122e29ae4901f2c2dd47afc2dd98b2d3))
- **validateReqBody:** add validateHasReturnURL for link-gen endpoints ([4a6f9fa](https://github.com/Nerdware-LLC/fixit-api/commit/4a6f9fa5aaaf501fb7152963b67f1eed2ca4c4c2))

# [1.15.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.14.0...v1.15.0) (2022-12-01)

### Features

- **apolloServer:** add plugins and typing for apollo context ([083a267](https://github.com/Nerdware-LLC/fixit-api/commit/083a267f480be2ca131c98ec09ec70368051c0ce))
- **apollo:** update apollo plugin config to use remote schema ([0d00129](https://github.com/Nerdware-LLC/fixit-api/commit/0d0012993a107f8b5fa8f61768196a6f2df700a7))
- **codegen:** add GQL-codegen config+scripts ([5694dec](https://github.com/Nerdware-LLC/fixit-api/commit/5694decdf43e982d89acc0ba95d360f3ef71dc0e))
- **cors:** add apollo+sentry related http headers and origins ([b5e4f95](https://github.com/Nerdware-LLC/fixit-api/commit/b5e4f95b2acdc5f4545b7c243ed1b5a0eddc7d40))
- **env:** separate 'SELF_URI' into component parts PROTOCOL and DOMAIN ([967a4c7](https://github.com/Nerdware-LLC/fixit-api/commit/967a4c763622fae94e49b0674ada8fc83d8f7324))
- **id-regex:** update Stripe-ID regexs to reflect variable length ([7ba2b48](https://github.com/Nerdware-LLC/fixit-api/commit/7ba2b48c16c1f11d609b78ea2516865464591689))
- **mw/auth:** improve edge-case handling for gql-ctx and queryUserItems ([1121422](https://github.com/Nerdware-LLC/fixit-api/commit/11214223431e34d51e30e2d4e342ea7dc6b3007d))
- **mw/clientInput:** rm 'promoCode' from required fields in submit-payment route ([7d404d1](https://github.com/Nerdware-LLC/fixit-api/commit/7d404d1809bfe66b678a19632a77aa1d1ef2a5e4))
- **mw/subs:** update logic in payment-handling mw ([3c073fc](https://github.com/Nerdware-LLC/fixit-api/commit/3c073fc2053f99e92f415255ba1225e32955fade))
- **mw/utils:** add type-safety check on req.body ([919c586](https://github.com/Nerdware-LLC/fixit-api/commit/919c586902eaeadc5e18d5002678a2366a3d0c03))
- **paths:** add src/types path aliases ([3f60729](https://github.com/Nerdware-LLC/fixit-api/commit/3f6072952fbcd5577065588c2d34db6699798047))
- **types:** add GQL codegen types ([0c5128d](https://github.com/Nerdware-LLC/fixit-api/commit/0c5128da2b8481d56d49c6d0c145aa467757ba7a))
- **types:** update fields available on ProcessEnv ([3d70739](https://github.com/Nerdware-LLC/fixit-api/commit/3d70739f787cd048b3d82feb21d8464d83a8c137))
- update ref to env var 'API_BASE_URL' ([6917fb4](https://github.com/Nerdware-LLC/fixit-api/commit/6917fb485afd5a7dd3394271d0921dc8b4efdf4a))

# [1.14.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.13.0...v1.14.0) (2022-11-07)

### Bug Fixes

- **apolloServer:** rm User type-cast in context fn ([178d65f](https://github.com/Nerdware-LLC/fixit-api/commit/178d65f551995bdbd4c50f9b6daed4ac5e2de3fb))
- **ci:** rm 'ci=false' from Semantic Release config file ([6cf9ba2](https://github.com/Nerdware-LLC/fixit-api/commit/6cf9ba261c9cbcf49ef12ef9dfeaa57463749cfd))
- **cors:** correct 'self-uri' origin regex ([ba161c6](https://github.com/Nerdware-LLC/fixit-api/commit/ba161c6c81d94f6e0132f60eae506fa508b3e2cf))
- **ECR-push:** correct docker push cmd syntax ([abdaf1f](https://github.com/Nerdware-LLC/fixit-api/commit/abdaf1f125f92c8f176903cfcede085bc3bb5cf4))
- **ECR-push:** correct docker push cmd syntax ([b94ccd7](https://github.com/Nerdware-LLC/fixit-api/commit/b94ccd78a6021c3e55ea92a85083145e5e41f8a9))
- **ECR-push:** correct docker tag syntax for push to ECR ([d5156fe](https://github.com/Nerdware-LLC/fixit-api/commit/d5156fedc139266879f14017d0c7a321a7e910cd))
- **errors:** convert old ApolloErrs into new GqlErrs ([786304b](https://github.com/Nerdware-LLC/fixit-api/commit/786304bb7d1d6eaa6ea97a6258122569ff303835))
- **jwt:** rm dupe protocol url-component from 'aud' ([dd7927a](https://github.com/Nerdware-LLC/fixit-api/commit/dd7927a7b07cbfa762a323997e9aa9233e1bb652))
- **MW-type:** change req.\_user type to include AuthTokenPayload union ([0b8b5ad](https://github.com/Nerdware-LLC/fixit-api/commit/0b8b5ad95d34210140b9798aaaa619e26a0b44ad))
- **mw:** update cors+httpHeaders mw to use /api base route ([d2d78bc](https://github.com/Nerdware-LLC/fixit-api/commit/d2d78bc8ab269027e28c13ef93e912e7b2ca4e68))
- **release:** correct filename for semantic release config file ([b1bfdf9](https://github.com/Nerdware-LLC/fixit-api/commit/b1bfdf9231b46a6b6be29724f62444c57d1e3e75))
- **User.createOne:** ensure SCA is attached to newUser ([da1bcdd](https://github.com/Nerdware-LLC/fixit-api/commit/da1bcdd4dedcfcc010d7a3b1a33f89f6ef9d6906))
- **validateReqBody:** correct keys req for auth routes ([669823b](https://github.com/Nerdware-LLC/fixit-api/commit/669823b9f5b408bc7f62017fb605f6a848ab854e))

### Features

- add '@types/cors' npm package to dev-deps ([dc53194](https://github.com/Nerdware-LLC/fixit-api/commit/dc53194fa5a050fe56115a86246811cc14cb999f))
- **apollo:** upgrade to Apollo Server v4 ([8a79211](https://github.com/Nerdware-LLC/fixit-api/commit/8a7921132df9dc9dfc2a2fb1dab6b163a7555732))
- **auth:** mv apolloServer context-auth fn into mw/auth ([20de0ad](https://github.com/Nerdware-LLC/fixit-api/commit/20de0adb5e6c425650c9633b47e9666eadb172f9))
- **authRouter:** add 'updateExpoPushToken' to login route ([162f9a0](https://github.com/Nerdware-LLC/fixit-api/commit/162f9a02ed5f706d6151fc31940827a4092b4c33))
- convert ConnectRouter and some MWs from js to ts ([343cccf](https://github.com/Nerdware-LLC/fixit-api/commit/343cccf5f3d407cd96fce100f15ae1040af71e4a))
- **Dockerfile:** change exposed port to 80 ([dfb2323](https://github.com/Nerdware-LLC/fixit-api/commit/dfb2323ca8d75f75cdb1784a47c764753bcd574a))
- **env:** rm unused keys from ENV object ([1fcd6bb](https://github.com/Nerdware-LLC/fixit-api/commit/1fcd6bbbdb7a4edb007407c7659d7bc88cf494eb))
- **errors:** add Gql custom errors to replace ApolloErrors ([462f816](https://github.com/Nerdware-LLC/fixit-api/commit/462f8167407855da2bf2c3c4fd5f5249ec5b4880))
- **Expand:** ensure Date objects are not 'expanded' ([8b22a82](https://github.com/Nerdware-LLC/fixit-api/commit/8b22a824462d7ff8f3cfd855b0c3a8592b5a056c))
- **getTypeSafeErr:** add option to override fallback err msg ([604f43a](https://github.com/Nerdware-LLC/fixit-api/commit/604f43af755bc108b78d3a37573c4b1a704d10ef))
- **gql:** migrate 'gql' tag imports to 'graphql-tag' for apollo-v4 ([e63feb7](https://github.com/Nerdware-LLC/fixit-api/commit/e63feb78aa1d0c7106021493c48ddff20bbb2a1e))
- **nvm:** add nvmrc config file ([4f64dff](https://github.com/Nerdware-LLC/fixit-api/commit/4f64dffd7b5618463737aa927c1b7a56f17a7feb))
- **routes:** update Stripe Link-mw to use /api base route ([3d3d555](https://github.com/Nerdware-LLC/fixit-api/commit/3d3d5556c7ada4762abd58306e768d1c70d7ba36))
- **server:** migrate expressApp+apolloServer to apollo-v4 ([a8f7997](https://github.com/Nerdware-LLC/fixit-api/commit/a8f79976078dfea978db9a07b66f7dd6d01da3a8))
- **Stripe-WHs:** rm old 'secret-bucket' env var ([b07ea41](https://github.com/Nerdware-LLC/fixit-api/commit/b07ea414d677d193fc96e19b91a0483c518c2fab))
- **Stripe-WHs:** rm s3client, update StripeWebhooksHandler ([a7f1399](https://github.com/Nerdware-LLC/fixit-api/commit/a7f13992f221b096b51056b81e6c8c31300d2c46))
- **types:** rm unused keys from process.env ambient typedef ([c86a2f5](https://github.com/Nerdware-LLC/fixit-api/commit/c86a2f57edbe140701de298379350dec022bb28f))
- **User:** convert 'expoPushToken' to optional create param for non-mobile ([b55620c](https://github.com/Nerdware-LLC/fixit-api/commit/b55620cac65137768cbc663883c215889173f0ac))

# [1.13.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.12.1...v1.13.0) (2022-10-08)

### Bug Fixes

- **Dockerfile:** swap build flag '--production' for '--omit=dev' ([89a81b0](https://github.com/Nerdware-LLC/fixit-api/commit/89a81b069d810d5529153f9a515698bcff3dd411))

### Features

- **colors:** uninstall unnecessary @types/colors pkg ([db36a0c](https://github.com/Nerdware-LLC/fixit-api/commit/db36a0c9ae1ebf679ff882d4dfe091626205031a))
- **ECR-push:** add workflow_dispatch trigger to allow manual runs ([5c5dd6e](https://github.com/Nerdware-LLC/fixit-api/commit/5c5dd6e7c4e345fefd833b3526af1e433cdfd8ce))
- **ECR-push:** on 'release' events swap tags main/next w prod/staging ([703d4e7](https://github.com/Nerdware-LLC/fixit-api/commit/703d4e7a18647505ac100003a42cdf568a23d4e8))

## [1.12.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.12.0...v1.12.1) (2022-10-08)

### Bug Fixes

- **releaserc:** add package.json assets to SR/git plugin ([7af3e6f](https://github.com/Nerdware-LLC/fixit-api/commit/7af3e6f957a8e22b80a8e82c5684dc34a61b0c09))

# [1.12.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.11.0...v1.12.0) (2022-10-08)

### Bug Fixes

- **ECR-push:** rm push-events from event triggers, only on release now ([a03c954](https://github.com/Nerdware-LLC/fixit-api/commit/a03c954379765b4032aaa549006f4a8a9cb6b519))
- **release-action:** add releaserc to file triggers ([e35ce21](https://github.com/Nerdware-LLC/fixit-api/commit/e35ce2194fbadb8374194c5ec1b519851ffe4d58))

### Features

- **SemanticRelease:** add npm release plugin, rm unused release rules ([f28201d](https://github.com/Nerdware-LLC/fixit-api/commit/f28201dc87d47260b90da72c11745c2d841671ab))

# [1.11.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.10.0...v1.11.0) (2022-10-08)

### Features

- **EventEmitter:** add mock event handlers to EE for test env ([f313408](https://github.com/Nerdware-LLC/fixit-api/commit/f313408599f6a45e89d812a08cf29acec72e4d48))
- **MW-security:** convert from JW to TS, update staging/prod CORS origins ([39bccea](https://github.com/Nerdware-LLC/fixit-api/commit/39bccea1a50b562bbafbbca1a2c6ba5694ed81c8))
- **MW-stripeConnect:** convert from JW to TS, impl new Auth'd UserData type ([1784c0e](https://github.com/Nerdware-LLC/fixit-api/commit/1784c0e615cbe8388f570fbdf42aeb06c2664332))
- **Stripe-WHs:** convert handlers from JS to TS ([01c15f0](https://github.com/Nerdware-LLC/fixit-api/commit/01c15f08a15be9e9296d0bdc86e8484da3065c3c))
- **User-types:** add 'AuthenticatedUser' type for MW req objs ([d6203b7](https://github.com/Nerdware-LLC/fixit-api/commit/d6203b78e25f5c0d52d1233a3157b5c30beac0fe))
- **UserSCA:** add updateOne model method ([1962a1e](https://github.com/Nerdware-LLC/fixit-api/commit/1962a1e93d57f68bb370a9e2e0a6e68a5d7af46b))
- **UserSub:** add updateOne model method ([b31cbf8](https://github.com/Nerdware-LLC/fixit-api/commit/b31cbf84bfe0e8475e5f052702a246afe89f6b82))

# [1.10.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.9.0...v1.10.0) (2022-10-07)

### Bug Fixes

- **docker:** update file refs in docker-related files ([7853975](https://github.com/Nerdware-LLC/fixit-api/commit/7853975d79fd404112498ba01d6459d948831e43))

### Features

- **ECR-push:** add GitHub Action ecr_image_push ([54a5011](https://github.com/Nerdware-LLC/fixit-api/commit/54a50117e3ae0c9e7edd8f2933cecd321a7a978d))
- **gql:** convert gql schema,customScalars,deleteMutResp to TS ([6c253a6](https://github.com/Nerdware-LLC/fixit-api/commit/6c253a67c4dda4d4d9ce3b7dcd88afb99d5e20d6))

# [1.9.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.8.0...v1.9.0) (2022-10-07)

### Bug Fixes

- **DDB-ST:** add ExprAttrNames to auto-gen fn; correct transformValue hook logic ([d776be2](https://github.com/Nerdware-LLC/fixit-api/commit/d776be281f51cd47c439a6a0f27337e1f2d1d93f))
- **models:** add Model tests, correct schema where necessary ([aa24195](https://github.com/Nerdware-LLC/fixit-api/commit/aa2419579aa660e3fb183c41ef1e1e2b868dfc79))
- **util-regex:** add colon to possible chars in street line 2 ([e8b422a](https://github.com/Nerdware-LLC/fixit-api/commit/e8b422a2d13f1c37b271170522672b24d759b388))

### Features

- **models-tests:** add ddb batchDelete to afterAll models' tests ([16a6301](https://github.com/Nerdware-LLC/fixit-api/commit/16a6301769d1d769b461fcb02c41fa74dbd828ca))
- **tests:** add Jest globalSetup for ddb-local ([6f3ccac](https://github.com/Nerdware-LLC/fixit-api/commit/6f3ccace0dc5045a470e3871320c68108926cee1))
- **tsconfig:** add path alias '[@tests](https://github.com/tests)' for src/**tests** ([7df046e](https://github.com/Nerdware-LLC/fixit-api/commit/7df046e42af55c84658e5568f2dd92c59c6c69b5))

# [1.8.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.7.0...v1.8.0) (2022-10-05)

### Bug Fixes

- **Model:** add 'doesHaveDefinedProperty', ensure IO actions account for undefined values ([e5e080d](https://github.com/Nerdware-LLC/fixit-api/commit/e5e080de5882e28a9239eff7974be27b26ad2256))
- **models:** ensure PHONE common attr doesnt pass undefined to transform fns ([e44ea1c](https://github.com/Nerdware-LLC/fixit-api/commit/e44ea1c1f681d0743bca52329958bd89f5635423))

### Features

- **WO:** add tests for WO.createOne, fix schema elements ([07ac0b4](https://github.com/Nerdware-LLC/fixit-api/commit/07ac0b44a69fbb2188cee7c75c9388174977aacd))

# [1.7.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.6.0...v1.7.0) (2022-10-05)

### Bug Fixes

- **DDB-ST:** correct type of obj returned from upsertItem ([519aa5f](https://github.com/Nerdware-LLC/fixit-api/commit/519aa5f3f9d0126b395c2f54c06900ca32ba9b05))
- **env:** correct Stripe env var name casing ([0ec8abb](https://github.com/Nerdware-LLC/fixit-api/commit/0ec8abb0d07b0ba22ec79306b4d21bfe98dd679e))

### Features

- **err-MW:** convert error-handler MW to TS ([ac623f0](https://github.com/Nerdware-LLC/fixit-api/commit/ac623f02260133e7a53280647aff8ea7132c2142))
- **getTypeSafeErr:** add explicit 'Error' return type ([c0873a4](https://github.com/Nerdware-LLC/fixit-api/commit/c0873a41b3ce0492f9203043ef37099bf92ae67c))
- **PN-MW:** convert 'updateExpoPushToken' to TS ([e084337](https://github.com/Nerdware-LLC/fixit-api/commit/e084337ffd76f1be55806bff005949460d305771))
- **Subs-MW:** combine 2 Sub-related MW into 1 and convert to TS ([74de686](https://github.com/Nerdware-LLC/fixit-api/commit/74de68630522421a00c10c9bb675f7c7af256595))
- **UserSub:** add tests covering UserSub methods ([0d82b3d](https://github.com/Nerdware-LLC/fixit-api/commit/0d82b3d48b08206e89c05b27064072cb9115d928))

# [1.6.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.5.1...v1.6.0) (2022-10-05)

### Bug Fixes

- **DDB-ST:** add table/index throughput config opts; add ListTables cmd ([bc9839c](https://github.com/Nerdware-LLC/fixit-api/commit/bc9839c7ffe698cd19fb1368ce10c4ff47816db3))
- **Invoice.createOne:** correct type to include required keys on create ([178ce46](https://github.com/Nerdware-LLC/fixit-api/commit/178ce467200ffa710fd8d739273754414b2608ad))
- **Jest:** update 'collectCoverageFrom' so jest properly reports coverage ([475debe](https://github.com/Nerdware-LLC/fixit-api/commit/475debe9c99d8df75767199fd67f2f30230eb067))
- **Jwt:** convert typeof jwt key to string ([c905331](https://github.com/Nerdware-LLC/fixit-api/commit/c905331d9386b151f73f44389b2699bf7e1c4a98))
- **Model:** correct aliasedSchema ctor logic; add return types to api methods ([344ccd3](https://github.com/Nerdware-LLC/fixit-api/commit/344ccd3fcc9a12352795b7921c44b13a12da0818))
- **User.createOne:** correct obj types to include 'sk' ([6fb523b](https://github.com/Nerdware-LLC/fixit-api/commit/6fb523b9c902f49b257695f1e7465eadfd94ea40))
- **WO.createOne:** correct new WO type ([2f80a15](https://github.com/Nerdware-LLC/fixit-api/commit/2f80a15dc608b50abcd29f4dd1a3f897aca1cf15))

### Features

- **AuthToken:** rm 'profile.id' from jwt payload ([3ec5399](https://github.com/Nerdware-LLC/fixit-api/commit/3ec5399479e5a10244bb854ad2bdbc41c35aee1c))
- **env:** rm unused 'directives.should_run_mocks' from ENV obj ([7015ded](https://github.com/Nerdware-LLC/fixit-api/commit/7015deda161506afe6b85fe50f79dd74d9e0c04e))
- **models:** add 'createdAt' and 'updatedAt' to all models ([65a1a1f](https://github.com/Nerdware-LLC/fixit-api/commit/65a1a1f2ccc410aa1bfea8e51fe930d7d60a504d))
- **MW-auth:** convert auth MW to TS ([d180c44](https://github.com/Nerdware-LLC/fixit-api/commit/d180c446f409133f42d16caae2f0792876e4a938))
- **MW-wrappers:** add \_userQueryItems to Req type for pre-fetch queries ([97b0248](https://github.com/Nerdware-LLC/fixit-api/commit/97b0248ecf0aba699a1b28fdfe4c687c0fb96d07))
- **npm-test-scripts:** add DDB-local docker cmds to npm scripts ([1f6f977](https://github.com/Nerdware-LLC/fixit-api/commit/1f6f97753d8e82a82894e2b61741bc82a2d1ed0d))
- **tsconfig:** rm '[@types](https://github.com/types)' from tsconfig as it is unused ([2c5cac5](https://github.com/Nerdware-LLC/fixit-api/commit/2c5cac54f7406985f94d8ef18b88ecb226336c45))
- **User:** add test covering all User model methods ([3802624](https://github.com/Nerdware-LLC/fixit-api/commit/380262482da2b94d39dae5377dd3d5dc89ee8fd5))

## [1.5.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.5.0...v1.5.1) (2022-10-02)

# [1.5.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.4.1...v1.5.0) (2022-10-02)

### Bug Fixes

- **LambdaClient:** update payload type to allow objects to be passed into JSON.stringify ([cd85620](https://github.com/Nerdware-LLC/fixit-api/commit/cd8562040ba5b09dd1094e07f011bbd5c2bb28ea))
- **utils:** update utils index exports to export new util types ([f92b1cd](https://github.com/Nerdware-LLC/fixit-api/commit/f92b1cd9486f11e851ef8ad30299feec99856d78))

### Features

- **events:** convert all event handlers to TS ([1166ed8](https://github.com/Nerdware-LLC/fixit-api/commit/1166ed8d4a9279963e35d4256230165de7d6ee8e))
- **Models:** ensure all Model custom methods have param+return types ([d860c55](https://github.com/Nerdware-LLC/fixit-api/commit/d860c559209385d92572d933fc549b05957c1982))
- **type:** add 'UserType' return type to User.createOne ([caf2ed0](https://github.com/Nerdware-LLC/fixit-api/commit/caf2ed079c28674e6ff23de9cc1e63aa68d40a3c))
- **types:** add types for AuthToken ([5270fea](https://github.com/Nerdware-LLC/fixit-api/commit/5270feaf3851b6dd9446dbe0e7143f5c41f15041))
- **types:** add types for JWT-related values and util fns ([204d8ac](https://github.com/Nerdware-LLC/fixit-api/commit/204d8ac115c0779a1d450db3cc2390390b148036))
- **types:** add types for MW wrappers ([52c5ce5](https://github.com/Nerdware-LLC/fixit-api/commit/52c5ce57fc333442fd6764f17bf8a2b6ca9a26e0))
- **types:** convert 'getObjValuesByKeys' to TS, add types ([89fb684](https://github.com/Nerdware-LLC/fixit-api/commit/89fb6844554d11c7aaed96bfc64b3f0cecbe4d4e))
- **User:** add return types to User model custom methods ([a162e18](https://github.com/Nerdware-LLC/fixit-api/commit/a162e18ee21e9c9375230a01c4809251881bed8a))

## [1.4.1](https://github.com/Nerdware-LLC/fixit-api/compare/v1.4.0...v1.4.1) (2022-09-30)

### Bug Fixes

- **apollo:** commit delete old .js config file ([1557a10](https://github.com/Nerdware-LLC/fixit-api/commit/1557a10cd18a224f070dce3927652a92c99c4699))
- **apolloServer:** mv dynamic test-env imports out of ApolloServer inst call ([75f221a](https://github.com/Nerdware-LLC/fixit-api/commit/75f221a970711643ea13e252559548cdd3100929))
- **config-files:** update file extensions in config file settings ([5f050ee](https://github.com/Nerdware-LLC/fixit-api/commit/5f050eed6f34916eb47a2fd5a403133e3354566f))
- **DDB-ST:** correct Model.aliasMapping typings ([23923c9](https://github.com/Nerdware-LLC/fixit-api/commit/23923c976a7d4daf230484f6e504ad94b1e7166e))
- **DDB-ST:** misc eslint directives ([41c6c4c](https://github.com/Nerdware-LLC/fixit-api/commit/41c6c4c13619c3dec7752df18bfb3ea9044e576d))
- **eslint:** rm parserConfigs from overrides, was messing up parsing ([7a1a815](https://github.com/Nerdware-LLC/fixit-api/commit/7a1a8158470de61dd922e988cca2b2b21d871a3d))
- **models:** correct models' 'schema' property to as const for type parsing ([2fdb090](https://github.com/Nerdware-LLC/fixit-api/commit/2fdb0903d29ee660f647a9368d1fc67eda907ee5))
- **models:** mv User Sub/SCA types into own dirs, add 'Type' suffix ([9165e59](https://github.com/Nerdware-LLC/fixit-api/commit/9165e599a218036d2bb4085beec07e0eecb2a53a))
- **mw:** update mw with up-to-date Models/model enums ([6195562](https://github.com/Nerdware-LLC/fixit-api/commit/6195562b20dc50ec4bb713e32a7cdf899a04800c))
- **ts-build:** add 'build' tsconfig, update npm build script ([531a6db](https://github.com/Nerdware-LLC/fixit-api/commit/531a6db9738b3f9a8b17cc4d8ae4e44ae5017836))
- **utils:** rm dateTimeUtils, files now just use moment directly ([ae30523](https://github.com/Nerdware-LLC/fixit-api/commit/ae305238a9db943662b6593e6a24b4093d068244))

# [1.4.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.3.0...v1.4.0) (2022-09-29)

### Bug Fixes

- **DDB-ST-client:** rm default value from query opts ([7967570](https://github.com/Nerdware-LLC/fixit-api/commit/796757029c9bb5e1fecab734af3f8e26910378ed))
- **DDB-ST:** change toDB/fromDB call sigs to allow any ([e4102a4](https://github.com/Nerdware-LLC/fixit-api/commit/e4102a4afe4c4d6b27456ed5956a084ff1f566ea))
- **DDB-ST:** correct ioActions-related method param+return types ([b6a5bb4](https://github.com/Nerdware-LLC/fixit-api/commit/b6a5bb48cadefd03ba32772365872695026a4292))
- **DDB-ST:** rm'd extraneous class type params; nixed model() init method ([d68682f](https://github.com/Nerdware-LLC/fixit-api/commit/d68682f3a2cf7c19c554e38f961a39da5751d528))
- **eventEmitter:** add typings for FixitEventEmitter ([9e5af71](https://github.com/Nerdware-LLC/fixit-api/commit/9e5af716d77b4a3e5dd02abf7a5bc5d770187d6b))
- **models:** convert all Models to subclasses of DDBST Model ([11b6b47](https://github.com/Nerdware-LLC/fixit-api/commit/11b6b47dc10d80916a9d035b069403696c244476))

### Features

- **DDB-ST:** add conversion of types Date<-->Unix and Buffer<-->binary ([6a12601](https://github.com/Nerdware-LLC/fixit-api/commit/6a12601ba6f042ed5ccaa9bdfdb6dd5b0ecf28bf))
- **DDB-ST:** impl 'addModelMethods' feature which binds custom methods ([4909206](https://github.com/Nerdware-LLC/fixit-api/commit/4909206ad954016228fbd0c2192db67793fdb375))
- **Model.query:** add alias mapping to KeyConditionExpression ([a34622c](https://github.com/Nerdware-LLC/fixit-api/commit/a34622c931481bd08e813501fd2444509d9bd8ec))

# [1.3.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.2.0...v1.3.0) (2022-09-26)

### Bug Fixes

- **jest:** update jest config to work with TS and ESM ([c8628dd](https://github.com/Nerdware-LLC/fixit-api/commit/c8628dd898f88deb812e24a34669081927512b0a))
- **Model:** update import path to dynamoose package (no local) ([290efe9](https://github.com/Nerdware-LLC/fixit-api/commit/290efe9d3208de7bd01146695c5bfc725296a4b7))
- **path-alias:** uncomment module-alias/register for running build ([c4714a8](https://github.com/Nerdware-LLC/fixit-api/commit/c4714a809c787cd12d3b0324163cce29be507335))
- **util/uuid:** update export type to fn not value ([85b4c07](https://github.com/Nerdware-LLC/fixit-api/commit/85b4c071a7689e05e49822b4bd8d39370ecbfbeb))
- **uuid:** correct UUIDv1 regex pattern string util ([ec031a6](https://github.com/Nerdware-LLC/fixit-api/commit/ec031a61b65f34775e8c1ed6cda2c8b72a4246f4))
- **webhooksRouter:** add getTypeSafeErr to wh-mw catch block ([b5a1d3a](https://github.com/Nerdware-LLC/fixit-api/commit/b5a1d3abbba6ca4c5991ad97aa62e4309def6e8c))

### Features

- **Docker:** ch rm-test-files cmds to silence find output, +ignore test files ([2791b26](https://github.com/Nerdware-LLC/fixit-api/commit/2791b26c135cef06f388f47332db45eefb1d37e6))
- **Dockerfile:** rm hard-coded LABELS ([0a6ad09](https://github.com/Nerdware-LLC/fixit-api/commit/0a6ad09475bbbef63f962ad1a7272172b1650a35))
- **env:** add local stripe-wh-secrets for dev/test envs ([ed8cbfb](https://github.com/Nerdware-LLC/fixit-api/commit/ed8cbfbcc6cca894cf37e5862441003ecd060a7f))
- **Errors:** add CustomHttpError abstract class ([5130055](https://github.com/Nerdware-LLC/fixit-api/commit/513005505658cd23ae9cacc7f874489be539c072))
- **logger:** add 'test' namespace to logger util ([f70ddcc](https://github.com/Nerdware-LLC/fixit-api/commit/f70ddccf947b2d39f1b6832b74fb38063324aa9a))
- **nodemon:** add 2.5 sec delay to nodemon config ([6a6afa6](https://github.com/Nerdware-LLC/fixit-api/commit/6a6afa686490a8aa14b29b6343b071c699e9c43c))
- **PushNotification:** add PN base class ([e785334](https://github.com/Nerdware-LLC/fixit-api/commit/e785334be1fae377859f431a572f100b90e9a15a))
- **Sentry:** add sentry tracing and err-capture in proc-error handlers ([e7063e0](https://github.com/Nerdware-LLC/fixit-api/commit/e7063e0094ee34cfa2b244040925f46d8bcad11c))
- **types:** add various ambient type defs for global usage ([75c7ba8](https://github.com/Nerdware-LLC/fixit-api/commit/75c7ba82f59e6f311c41c4593b95bbbd5b6be678))

# [1.2.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.1.0...v1.2.0) (2022-09-06)

### Features

- init commit Dockerfile, compose file, build script ([d7ec947](https://github.com/Nerdware-LLC/fixit-api/commit/d7ec947336eb8e074a99c476aef6ff6ec7686583))
- init commit src files ([8c2a3fa](https://github.com/Nerdware-LLC/fixit-api/commit/8c2a3faeaf02943f74d9cfc637eae91eb25d5e81))

# [1.1.0](https://github.com/Nerdware-LLC/fixit-api/compare/v1.0.0...v1.1.0) (2022-09-06)

### Features

- init commit profject configs, init update README, add README assets ([613d1ec](https://github.com/Nerdware-LLC/fixit-api/commit/613d1ec7bd92fd3d8a0f6fa7a632f3348fc6a756))

# 1.0.0 (2022-08-06)

### Features

- init update template-repo files ([2b52992](https://github.com/Nerdware-LLC/fixit-api/commit/2b52992fe8cc8553b73f711b3d84ee98dde98970))
