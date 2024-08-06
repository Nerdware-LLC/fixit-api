/**
 * Fixit OpenAPI Schema Types
 *
 * DO NOT MAKE DIRECT CHANGES TO THIS FILE.
 *
 * This file was auto-generated using schema version: `2.1.2`
 */

export interface paths {
    "/admin/csp-violation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Logs CSP violation reports. */
        post: operations["CspViolation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/healthcheck": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Responds to load balancer healthchecks. */
        get: operations["Healthcheck"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Authenticates a user for the purposes of accessing protected resources.
         *      */
        post: operations["Login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Registers a new user. */
        post: operations["Register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Refreshes an existing user's auth token. */
        post: operations["RefreshToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/google-token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Authenticates a user via Google OAuth JSON JWT from GoogleID services. */
        post: operations["GoogleToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password-reset-init": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Initiates the password-reset flow for a user. */
        post: operations["PasswordResetInit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password-reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Updates the user's password to complete the password-reset flow. */
        post: operations["PasswordReset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/connect/account-link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Provides a link to the Stripe Connect Account onboarding portal. */
        post: operations["ConnectAccountLink"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/connect/dashboard-link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Provides a link to the Stripe Connect Account dashboard portal. */
        get: operations["ConnectDashboardLink"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions/check-promo-code": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Checks the validity of the provided promo code. */
        post: operations["CheckPromoCode"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions/customer-portal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Provides a link to the Stripe Customer portal. */
        post: operations["SubscriptionsCustomerPortal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions/submit-payment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Processes checkout payment information. */
        post: operations["SubscriptionsSubmitPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        UserRegistrationParams: components["schemas"]["LoginCredentials"] & components["schemas"]["ExpoPushTokenParam"] & {
            handle: components["schemas"]["handle"];
            email: components["schemas"]["email"];
            phone?: components["schemas"]["phone"];
        };
        LoginParams: components["schemas"]["LoginCredentials"] & components["schemas"]["ExpoPushTokenParam"];
        LoginCredentials: components["schemas"]["LoginCredentials.Local"] | components["schemas"]["LoginCredentials.GoogleOAuth"];
        LocalLoginCredentials: components["schemas"]["LoginCredentials.Local"];
        GoogleOAuthLoginCredentials: components["schemas"]["LoginCredentials.GoogleOAuth"];
        /** @description An object which contains a base64-encoded JSON JWT from GoogleID services
         *     under the key "googleIDToken".
         *      */
        GoogleIDTokenField: {
            googleIDToken: components["schemas"]["googleIDToken"];
        };
        /** @description A user's Expo push token, which is used to send push notifications to the user's mobile device. This is an optional parameter which is only sent from mobile clients.
         *      */
        ExpoPushTokenParam: {
            /** @description A user's Expo push token (only available on mobile clients). */
            expoPushToken?: string;
        };
        /** @description The email address of the user initiating a password reset */
        PasswordResetInitParams: {
            email: components["schemas"]["email"];
        };
        /** @description A new password and a valid password reset token */
        PasswordResetParams: {
            password: components["schemas"]["password"];
            passwordResetToken: components["schemas"]["passwordResetToken"];
        };
        /** @description An object which contains an encoded and stringified auth token. */
        AuthTokenResponseField: {
            /** @description An encoded and stringified auth token. */
            token: string;
        };
        /** @description An object which contains pre-fetched user items under the key `userItems`.
         *      */
        PreFetchedUserItemsResponseField: {
            userItems: components["schemas"]["PreFetchedUserItems"];
        };
        /** @description A User's pre-fetched WorkOrders, Invoices, and Contacts, which are written
         *     into the client's Apollo Client cache on the front-end (used on logins).
         *     This object's properties correspond to GraphQL queries of the same name.
         *      */
        PreFetchedUserItems: {
            /** @description Pre-fetched `myWorkOrders` query objects for the front-end cache. */
            myWorkOrders: {
                /** @description Work orders created by the user. */
                createdByUser: components["schemas"]["WorkOrder"][];
                /** @description Work orders assigned to the user. */
                assignedToUser: components["schemas"]["WorkOrder"][];
            };
            /** @description Pre-fetched `myInvoices` query objects for the front-end cache. */
            myInvoices: {
                /** @description Invoices created by the user. */
                createdByUser: components["schemas"]["Invoice"][];
                /** @description Invoices assigned to the user. */
                assignedToUser: components["schemas"]["Invoice"][];
            };
            /** @description Pre-fetched `myContacts` query objects for the front-end cache. */
            myContacts: components["schemas"]["Contact"][];
        };
        /** @description A pre-fetched Contact object returned from a REST endpoint. */
        Contact: {
            /**
             * @description The object's GraphQL type name, `"Contact"`, included to facilitate
             *     writing pre-fetched objects into the front-end's Apollo Client cache.
             *
             * @enum {string}
             */
            __typename: "Contact";
            /** @description The contact's user ID */
            id: string;
            handle: components["schemas"]["handle"];
            email: components["schemas"]["email"];
            phone: components["schemas"]["phone"];
            profile: components["schemas"]["UserProfile"];
            createdAt: components["schemas"]["createdAt"];
            updatedAt: components["schemas"]["updatedAt"];
        };
        /** @description A pre-fetched Invoice object returned from a Fixit REST endpoint. */
        Invoice: {
            /**
             * @description The object's GraphQL type name, `"Invoice"`, included to facilitate
             *     writing pre-fetched objects into the front-end's Apollo Client cache.
             *
             * @enum {string}
             */
            __typename: "Invoice";
            /** @description The invoice's ID. */
            id: string;
            /** @description The user who created the invoice. */
            createdBy: {
                /** @description The ID of the user who created the invoice. */
                id: string;
            };
            /** @description The user to whom the invoice is assigned. */
            assignedTo: {
                /** @description The ID of the user to whom the invoice is assigned. */
                id: string;
            };
            /** @description The Invoice amount, represented as an integer which reflects USD centage
             *     (i.e., an 'amount' of 1 = $0.01 USD).
             *      */
            amount: number;
            status: components["schemas"]["InvoiceStatus"];
            /** @description The ID of the most recent successful paymentIntent applied to the Invoice, if any.
             *      */
            stripePaymentIntentID?: string | null;
            /** @description The work order associated with the invoice. */
            workOrder?: {
                /** @description The ID of the work order associated with the invoice. */
                id: string;
            } | null;
            createdAt: components["schemas"]["createdAt"];
            updatedAt: components["schemas"]["updatedAt"];
        };
        /** @description A pre-fetched WorkOrder object returned from a REST endpoint. */
        WorkOrder: {
            /**
             * @description The object's GraphQL type name, `"WorkOrder"`, included to facilitate
             *     writing pre-fetched objects into the front-end's Apollo Client cache.
             *
             * @enum {string}
             */
            __typename: "WorkOrder";
            /** @description The work order's ID. */
            id: string;
            /** @description The user who created the work order. */
            createdBy: {
                /** @description The ID of the user who created the work order. */
                id: string;
            };
            /** @description The user to whom the work order is assigned. */
            assignedTo?: {
                /** @description The ID of the user to whom the work order is assigned. */
                id: string;
            } | null;
            location: components["schemas"]["Location"];
            status: components["schemas"]["WorkOrderStatus"];
            priority: components["schemas"]["WorkOrderPriority"];
            category?: components["schemas"]["WorkOrderCategory"];
            /** @description The work order's description. */
            description?: string | null;
            /** @description The work order's checklist. */
            checklist?: {
                /** @description The ID of the checklist item. */
                id: string;
                /** @description The description of the checklist item. */
                description: string;
                /** @description Whether the checklist item is completed. */
                isCompleted: boolean;
            }[] | null;
            /**
             * Format: date-time
             * @description Timestamp of the WorkOrder's due date.
             */
            dueDate?: Date | null;
            /**
             * Format: date-time
             * @description Timestamp of the WorkOrder's scheduled completion.
             */
            scheduledDateTime?: Date | null;
            /** @description The name of the work order's entry contact, if any. */
            entryContact?: string | null;
            /** @description The phone number of the work order's entry contact, if any. */
            entryContactPhone?: string | null;
            /** @description Notes from the WorkOrder's recipient. */
            contractorNotes?: string | null;
            createdAt: components["schemas"]["createdAt"];
            updatedAt: components["schemas"]["updatedAt"];
        };
        /** @description An object which contains `promoCode` info under the key `promoCodeInfo`.
         *      */
        PromoCodeInfoResponseField: {
            promoCodeInfo: components["schemas"]["PromoCodeInfo"];
        };
        /** @description An object which contains information about whether a user-provided `promoCode`
         *     is valid, and if so, what percentage discount should be applied at checkout.
         *      */
        PromoCodeInfo: {
            /** @description The original value provided by the user. */
            value: string;
            /** @description Whether the user-provided `promoCode` is valid. */
            isValidPromoCode: boolean;
            /** @description The percentage discount to apply to the total price of the selected
             *     subscription. The returned number reflects a percentage, so a value of
             *     `10` would be a 10% discount. This field is only included in the response
             *     if the user-provided `promoCode` is valid.
             *      */
            discountPercentage?: number;
        };
        /** @description An object which contains data used for completing checkout/payment flows.
         *      */
        CheckoutCompletionInfoResponseField: {
            checkoutCompletionInfo: components["schemas"]["CheckoutCompletionInfo"];
        };
        /** @description An object containing data regarding the status of the user's checkout-flow. In
         *     the event that additional user input is required to complete the transaction,
         *     this object will also contain the Stripe-provided client secret needed for the
         *     front-end to invoke `stripe.handleNextAction`.
         *      */
        CheckoutCompletionInfo: {
            /** @description A boolean indicating whether the checkout-flow is complete. A value of
             *     `true` indicates one of the following success conditions:
             *     - The user/customer owed a non-zero amount which was successfully paid.
             *     - The user/customer initiated a `TRIAL`, and the setup for payments after
             *       the end of the trial-period has been successfully completed.
             *     - The user/customer provided a 100% discount `PROMO_CODE`, and the setup
             *       for payments after the end of the discount-period has been successfully
             *       completed.
             *      */
            isCheckoutComplete: boolean;
            /** @description If additional user input is required to complete the transaction, such as
             *     authenticating with 3D Secure or redirecting to a different site, this
             *     property will contain the Stripe-provided client secret needed for the
             *     front-end to invoke `stripe.handleNextAction`.
             *      */
            clientSecret?: string;
        };
        /** @description An object which contains a link to a Stripe-provided portal. */
        StripeLinkResponseField: {
            /** @description A link to a Stripe-provided portal. */
            stripeLink: string;
        };
        /** @description User's Fixit API auth token payload object. */
        AuthTokenPayload: {
            /** @description An identifier for the user. */
            id: string;
            handle: components["schemas"]["handle"];
            email: components["schemas"]["email"];
            phone: components["schemas"]["phone"];
            profile: components["schemas"]["UserProfile"];
            stripeCustomerID: components["schemas"]["stripeCustomerID"];
            stripeConnectAccount: components["schemas"]["AuthTokenPayloadStripeConnectAccountInfo"];
            subscription: components["schemas"]["AuthTokenPayloadSubscriptionInfo"] | null;
            createdAt: components["schemas"]["createdAt"];
            updatedAt: components["schemas"]["updatedAt"];
        };
        /** @description An object within the payload of a user's Fixit API auth token with data
         *     relating to their current Fixit Subscription status.
         *      */
        AuthTokenPayloadSubscriptionInfo: {
            /** @description An identifier for the subscription. */
            id: string;
            status: components["schemas"]["SubscriptionStatus"];
            /**
             * Format: date-time
             * @description Timestamp indicating the end of the current billing period.
             */
            currentPeriodEnd: Date;
        };
        /** @description An object within the payload of a user's Fixit API auth token with data
         *     relating to their current status in the Stripe Connect onboarding flow.
         *      */
        AuthTokenPayloadStripeConnectAccountInfo: {
            /** @description An identifier for the Stripe Connect Account. */
            id: string;
            /** @description A boolean indicating whether the user has submitted their details to
             *     Stripe Connect in the onboarding flow.
             *      */
            detailsSubmitted: boolean;
            /** @description A boolean indicating whether the user has enabled charges on their
             *     Stripe Connect Account.
             *      */
            chargesEnabled: boolean;
            /** @description A boolean indicating whether the user has enabled payouts on their
             *     Stripe Connect Account.
             *      */
            payoutsEnabled: boolean;
        };
        /** @description A Content Security Policy (CSP) violation report. */
        CspViolationReport: {
            /** @description The URI of the protected resource that was violated.
             *      */
            "document-uri"?: string;
            /** @description The URI of the resource that was blocked from loading.
             *      */
            "blocked-uri"?: string;
            /** @description The HTTP status code of the resource that was blocked from loading.
             *      */
            "status-code"?: number;
            /** @description The referrer of the protected resource that was violated.
             *      */
            referrer?: string;
            /** @description The first 40 characters of the inline script, event handler, or style
             *     that caused the violation.
             *      */
            "script-sample"?: string;
            /** @description The original policy as specified by the Content-Security-Policy header.
             *      */
            "original-policy"?: string;
            /**
             * @description Either "enforce" or "report" depending on whether the Content-Security-Policy
             *     header or the Content-Security-Policy-Report-Only header is used.
             *
             * @enum {string}
             */
            disposition?: "enforce" | "report";
            /** @description The directive whose enforcement was violated (e.g. "default-src 'self'").
             *      */
            "violated-directive"?: string;
            /** @description The effective directive that was violated (e.g. 'img-src').
             *      */
            "effective-directive"?: string;
            /** @description The URI of the resource where the violation occurred.
             *      */
            "source-file"?: string;
            /** @description The line number in the resource where the violation occurred.
             *      */
            "line-number"?: number;
            /** @description The column number in the resource where the violation occurred.
             *      */
            "column-number"?: number;
        };
        /** @description An error response object. */
        Error: {
            error?: string;
        };
        /** @description An object containing the components of an address. */
        Location: {
            /** @description The first line of the location's street address. */
            streetLine1: string;
            /** @description The second line of the location's street address. */
            streetLine2?: string | null;
            /** @description The location's city. */
            city: string;
            /** @description The location's region. */
            region: string;
            /**
             * @description The location's country.
             * @default USA
             */
            country: string;
        };
        /** @description A user's profile. */
        UserProfile: {
            /** @description The user's display name. */
            displayName: string;
            /** @description The user's family name. */
            familyName?: string | null;
            /** @description The user's given name. */
            givenName?: string | null;
            /** @description The user's business name. */
            businessName?: string | null;
            /** @description The user's profile picture URL. */
            photoUrl?: string | null;
        };
        /**
         * @description The Invoice's status.
         * @enum {string}
         */
        InvoiceStatus: "OPEN" | "CLOSED" | "DISPUTED";
        /**
         * @description The Fixit Subscription price name — this value corresponds to the [Stripe Price
         *     "nickname" field](https://stripe.com/docs/api/prices/object#price_object-nickname).
         *
         * @enum {string}
         */
        SubscriptionPriceName: "ANNUAL" | "MONTHLY" | "TRIAL";
        /**
         * @description The Subscription's status, as provided by Stripe.
         *     See https://docs.stripe.com/api/subscriptions/object#subscription_object-status
         *
         * @enum {string}
         */
        SubscriptionStatus: "active" | "incomplete" | "incomplete_expired" | "trialing" | "past_due" | "canceled" | "unpaid";
        /**
         * @description The WorkOrder's category.
         * @enum {string|null}
         */
        WorkOrderCategory: null | "DRYWALL" | "ELECTRICAL" | "FLOORING" | "GENERAL" | "HVAC" | "LANDSCAPING" | "MASONRY" | "PAINTING" | "PAVING" | "PEST" | "PLUMBING" | "ROOFING" | "TRASH" | "TURNOVER" | "WINDOWS";
        /**
         * @description The WorkOrder's priority.
         * @enum {string}
         */
        WorkOrderPriority: "LOW" | "NORMAL" | "HIGH";
        /**
         * @description The WorkOrder's status.
         * @enum {string}
         */
        WorkOrderStatus: "UNASSIGNED" | "ASSIGNED" | "IN_PROGRESS" | "DEFERRED" | "CANCELLED" | "COMPLETE";
        CreatedAt: components["schemas"]["createdAt"];
        Email: components["schemas"]["email"];
        GoogleIDToken: components["schemas"]["googleIDToken"];
        Handle: components["schemas"]["handle"];
        Password: components["schemas"]["password"];
        PasswordResetToken: components["schemas"]["passwordResetToken"];
        PaymentMethodID: components["schemas"]["paymentMethodID"];
        Phone: components["schemas"]["phone"];
        PromoCode: components["schemas"]["promoCode"];
        ReturnURL: components["schemas"]["returnURL"];
        StripeCustomerID: components["schemas"]["stripeCustomerID"];
        UpdatedAt: components["schemas"]["updatedAt"];
        /**
         * Format: email
         * @description User's email address.
         */
        email: string;
        /**
         * Format: password
         * @description User's password (auth: local). In order to be valid, a password must meet
         *     all of the following criteria:
         *       - Contains at least one lowercase letter.
         *       - Contains at least one uppercase letter.
         *       - Contains at least one number.
         *       - Contains at least one of `!`, `@`, `#`, `$`, `%`, `^`, `&`, and/or `*`.
         *       - Is at least 6 characters long, and no more than 250 characters long.
         *
         */
        password: string;
        /** @description The user's login credentials for local authentication */
        "LoginCredentials.Local": {
            email: components["schemas"]["email"];
            password: components["schemas"]["password"];
        };
        /** @description Base64URL-encoded JSON JWT from GoogleID services (auth: google-oauth).
         *      */
        googleIDToken: string;
        /** @description The user's login credentials for google-oauth authentication */
        "LoginCredentials.GoogleOAuth": {
            email: components["schemas"]["email"];
            googleIDToken: components["schemas"]["googleIDToken"];
        };
        /**
         * Format: date-time
         * @description Timestamp which indicates when the resource was created.
         */
        createdAt: Date;
        /**
         * Format: date-time
         * @description The timestamp which indicates when the resource was last updated.
         */
        updatedAt: Date;
        /** @description User's Fixit handle. */
        handle: string;
        /** @description User's phone number. Currently this API only supports US phone numbers. All
         *     whitespace, non-numeric characters, and country/calling code prefixes will be
         *     stripped from the phone number upon receipt, so "+1 (555) 555-5555" will be
         *     treated the same as "5555555555".
         *      */
        phone: string | null;
        /** @description A valid password-reset token for securely resetting a user's password.
         *      */
        passwordResetToken: string;
        /**
         * Format: uri
         * @description The URL Stripe should redirect the user to upon exiting the Stripe portal.
         *
         */
        returnURL: string;
        /** @description A user-provided promo code to apply a discount at checkout. */
        promoCode: string;
        /** @description The Stripe PaymentMethod ID of the user's chosen payment method. */
        paymentMethodID: string;
        /** @description User's Stripe Customer ID. */
        stripeCustomerID: string;
    };
    responses: {
        "200AuthTokenAndPreFetchedUserItems": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "200CheckPromoCode": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "200OK": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "201AuthToken": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "201AuthTokenAndCheckoutCompletionInfo": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "201StripeLink": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "204NoContent": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "400InvalidUserInput": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "401AuthenticationRequired": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "402PaymentRequired": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "403Forbidden": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "404ResourceNotFound": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        "5xxInternalServerError": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        UnexpectedResponse: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description [Unexpected Response] The server encountered an unexpected condition that
         *     prevented it from fulfilling the request. This fallback applies if no defined
         *     response status codes match the response.
         *      */
        "default.UnexpectedResponse": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description [204 No Content][mdn-docs] — Generic success response which does not
         *     include a response body.
         *
         *     [mdn-docs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204
         *      */
        "204.NoContent": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description [200 OK][mdn-docs] — Response for a successful authentication request. This
         *     response includes an authentication token, as well as pre-fetched user items
         *     to be stored in the client cache.
         *
         *     [mdn-docs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200
         *      */
        "200.AuthTokenAndPreFetchedUserItems": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["AuthTokenResponseField"] & components["schemas"]["PreFetchedUserItemsResponseField"];
            };
        };
        /** @description [400 Bad Request][mdn-docs] — Invalid user input.
         *
         *     [mdn-docs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400
         *      */
        "400.InvalidUserInput": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description [401 Unauthorized][mdn-docs] — Authentication required.
         *
         *     [mdn-docs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
         *      */
        "401.AuthenticationRequired": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description [5XX Internal Server Error][mdn-docs]
         *
         *     [mdn-docs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500
         *      */
        "5xx.InternalServerError": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description [201 Created][mdn-docs] — Response for successful user registration.
         *
         *     [mdn-docs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201
         *      */
        "201.AuthToken": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["AuthTokenResponseField"];
            };
        };
        /** @description [200][mdn-docs] — Generic success response for a request that was processed
         *     successfully, and which includes a response body.
         *
         *     [mdn-docs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200
         *      */
        "200.OK": {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description [201 Created][mdn-docs] — Response for successful creation of a Stripe link.
         *
         *     [mdn-docs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201
         *      */
        "201.StripeLink": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["StripeLinkResponseField"];
            };
        };
        /** @description [200 OK][mdn-docs] — Response for checking a promo code's validity.
         *
         *     [mdn-docs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200
         *      */
        "200.CheckPromoCode": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["PromoCodeInfoResponseField"];
            };
        };
        /** @description [201 Created][mdn-docs] — Response for successful payment submission.
         *
         *     [mdn-docs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201
         *      */
        "201.AuthTokenAndCheckoutCompletionInfo": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["AuthTokenResponseField"] & components["schemas"]["CheckoutCompletionInfoResponseField"];
            };
        };
        /** @description [402 Payment Required]
         *      */
        "402.PaymentRequired": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description [403 Forbidden] The requesting user is not authorized to perform this action.
         *      */
        "403.Forbidden": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description [404 Not Found] The requested resource could not be found.
         *      */
        "404.ResourceNotFound": {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
    };
    parameters: never;
    requestBodies: {
        CheckPromoCodeRequest: {
            content: {
                "application/json": {
                    promoCode: components["schemas"]["promoCode"];
                };
            };
        };
        GoogleTokenRequest: {
            content: {
                "application/json": components["schemas"]["GoogleIDTokenField"];
            };
        };
        LoginRequest: {
            content: {
                "application/json": components["schemas"]["LoginParams"];
            };
        };
        PasswordResetInitRequest: {
            content: {
                "application/json": components["schemas"]["PasswordResetInitParams"];
            };
        };
        PasswordResetRequest: {
            content: {
                "application/json": components["schemas"]["PasswordResetParams"];
            };
        };
        RefreshAuthTokenRequest: {
            content: {
                "application/json": components["schemas"]["ExpoPushTokenParam"];
            };
        };
        StripeLinkRequest: {
            content: {
                "application/json": {
                    returnURL: components["schemas"]["returnURL"];
                };
            };
        };
        UserRegistrationRequest: {
            content: {
                "application/json": components["schemas"]["UserRegistrationParams"];
            };
        };
    };
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    CspViolation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/csp-report": components["schemas"]["CspViolationReport"];
            };
        };
        responses: {
            204: components["responses"]["204.NoContent"];
            "4XX": components["responses"]["default.UnexpectedResponse"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    Healthcheck: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description [200 OK](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200)
             *      */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * @description The string constant "SUCCESS".
                         * @enum {string}
                         */
                        message: "SUCCESS";
                    };
                };
            };
            "4XX": components["responses"]["default.UnexpectedResponse"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    Login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["LoginRequest"];
        responses: {
            200: components["responses"]["200.AuthTokenAndPreFetchedUserItems"];
            400: components["responses"]["400.InvalidUserInput"];
            401: components["responses"]["401.AuthenticationRequired"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    Register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["UserRegistrationRequest"];
        responses: {
            201: components["responses"]["201.AuthToken"];
            400: components["responses"]["400.InvalidUserInput"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    RefreshToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: components["requestBodies"]["RefreshAuthTokenRequest"];
        responses: {
            200: components["responses"]["200.AuthTokenAndPreFetchedUserItems"];
            401: components["responses"]["401.AuthenticationRequired"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    GoogleToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["GoogleTokenRequest"];
        responses: {
            200: components["responses"]["200.AuthTokenAndPreFetchedUserItems"];
            400: components["responses"]["400.InvalidUserInput"];
            401: components["responses"]["401.AuthenticationRequired"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    PasswordResetInit: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["PasswordResetInitRequest"];
        responses: {
            200: components["responses"]["200.OK"];
            400: components["responses"]["400.InvalidUserInput"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    PasswordReset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["PasswordResetRequest"];
        responses: {
            200: components["responses"]["200.OK"];
            400: components["responses"]["400.InvalidUserInput"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    ConnectAccountLink: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["StripeLinkRequest"];
        responses: {
            201: components["responses"]["201.StripeLink"];
            400: components["responses"]["400.InvalidUserInput"];
            401: components["responses"]["401.AuthenticationRequired"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    ConnectDashboardLink: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: components["responses"]["201.StripeLink"];
            401: components["responses"]["401.AuthenticationRequired"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    CheckPromoCode: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["CheckPromoCodeRequest"];
        responses: {
            200: components["responses"]["200.CheckPromoCode"];
            400: components["responses"]["400.InvalidUserInput"];
            401: components["responses"]["401.AuthenticationRequired"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    SubscriptionsCustomerPortal: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["StripeLinkRequest"];
        responses: {
            201: components["responses"]["201.StripeLink"];
            400: components["responses"]["400.InvalidUserInput"];
            401: components["responses"]["401.AuthenticationRequired"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
    SubscriptionsSubmitPayment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    selectedSubscription: components["schemas"]["SubscriptionPriceName"];
                    paymentMethodID: components["schemas"]["paymentMethodID"];
                    promoCode?: components["schemas"]["promoCode"];
                };
            };
        };
        responses: {
            201: components["responses"]["201.AuthTokenAndCheckoutCompletionInfo"];
            400: components["responses"]["400.InvalidUserInput"];
            401: components["responses"]["401.AuthenticationRequired"];
            "5XX": components["responses"]["5xx.InternalServerError"];
            default: components["responses"]["default.UnexpectedResponse"];
        };
    };
}

