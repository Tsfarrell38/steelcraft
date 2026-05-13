# Current Useful API Endpoints

Base URL:

```text
https://coral-app-rsvlf.ondigitalocean.app
```

## Health

```text
GET /api/health
```

Expected healthy result:

```json
{
  "ok": true,
  "checks": {
    "app": "ok",
    "database": "connected",
    "monday": "configured",
    "spaces": "not_configured"
  }
}
```

## Schema setup

```text
POST /api/setup/schema
```

Initializes core, estimating, and HR schema after latest code is redeployed.

## Estimating schema status

```text
GET /api/estimating/schema/status
```

Returns estimating/billing tables.

## HR schema status

```text
GET /api/hr/schema/status
```

Returns HR/PTO/handbook/onboarding/training/HR concern tables after redeploy and initialization.

## Monday boards

```text
GET /api/monday/boards
POST /api/monday/sync-boards
GET /api/monday/migration/start
GET /api/monday/migration/summary
```

Note: Monday currently needs Seth/admin token to expose the real boards.

## Spaces status

```text
GET /api/spaces/status
```

Currently expected to be not configured unless DigitalOcean Spaces keys are added.

## Future HR endpoints to build

```text
GET /api/hr/employees
POST /api/hr/employees
GET /api/hr/pto/requests
POST /api/hr/pto/requests
POST /api/hr/pto/requests/:id/approve
POST /api/hr/pto/requests/:id/deny
GET /api/hr/concerns
POST /api/hr/concerns
PATCH /api/hr/concerns/:id
GET /api/hr/handbook
POST /api/hr/handbook/acknowledge
GET /api/hr/training/modules
POST /api/hr/training/assignments
PATCH /api/hr/training/assignments/:id/complete
```
