# Services

This directory contains the application's `services`.

### Service Design Goals

Each `service` is designed to achieve the following design goals:

- Serve as the primary location for business logic.
- Be _protocol agnostic_, i.e., be capable of use in both REST and GraphQL contexts (no request/response handling).
- Provide single points of entry for logical use cases which involve multiple [model](../models/README.md)-method invocations.
