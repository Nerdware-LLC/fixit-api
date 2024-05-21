# Controllers

This directory contains the application's `controllers`.

### Controller Design Goals

Each `controller` is designed to achieve the following design goals:

- Serve as the primary location for client request/response handling logic.
- Sanitize and validate incoming requests and any raw input values provided by clients.
- Invoke [service](../services/README.md) and [model](../models/README.md) methods as necessary to fulfill client requests.
