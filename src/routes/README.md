# REST API Routes

> [!NOTE]
>
> This directory contains the application's path-based routers.
>
> Each router is responsible for handling the requests to a specific REST API endpoint.

| Router                                      | REST API Path          |
| :------------------------------------------ | :--------------------- |
| [`adminRouter`](./admin.ts)                 | `/api/admin/*`         |
| [`authRouter`](./auth.ts)                   | `/api/auth/*`          |
| [`connectRouter`](./connect.ts)             | `/api/connect/*`       |
| [`subscriptionsRouter`](./subscriptions.ts) | `/api/subscriptions/*` |
| [`webhooksRouter`](./webhooks.ts)           | `/api/webhooks/*`      |
