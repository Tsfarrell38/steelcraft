# Portal Architecture Source of Truth

## Top-level architecture

The app now has exactly five top-level portals after the outside authentication page:

1. Admin Portal
2. Employee Portal
3. Accounting Portal
4. Vendor Portal
5. Customer Portal

Do not keep adding standalone portals outside this structure without an explicit architecture decision.

## Outside entry point

The first page is an authentication/login gateway.

After authentication, role-based routing sends the user to one of five portals:

- Admin users -> Admin Portal
- Internal Steel Craft employees -> Employee Portal
- Accounting/finance users -> Accounting Portal
- Vendors -> Vendor Portal
- Customers -> Customer Portal

## Admin Portal

Purpose: system control center.

Admin owns:

- Users
- Roles
- Portal/module permissions
- Database status
- Schema setup
- Monday integration
- File storage integration
- Email/e-signature/integration settings
- Audit logs
- Global workflow rules

Admin is not the internal employee workspace.

## Employee Portal

Purpose: internal Steel Craft operating portal.

The Employee Portal contains these internal modules:

- Sales & Estimating
- Project Portal
- Planning Portal
- HR Portal
- Accounts
- Contacts
- Erection Schedule

### Sales & Estimating

Includes:

- Estimate intake
- Scope builder
- Cost build
- Margin review
- Quote generator
- Project checklist
- Convert to project

### Project Portal

Includes:

- Contracted jobs
- Engineering
- Material
- Fabrication
- Delivery
- Erection
- Punch
- Closeout
- Project status
- Project documents

### Planning Portal

Planning Portal lives inside the Employee Portal.

Planning includes internal job readiness and execution planning:

- Job readiness
- Internal planning schedule
- Project handoffs
- Internal readiness notes
- Schedule blockers
- Production/field readiness checks

Financial control has moved out of Employee > Planning and into the Accounting Portal.

### HR Portal

HR Portal lives inside the Employee Portal.

HR includes:

- Salary employee records
- Start date
- Anniversary tracking
- PTO balance
- PTO tracking
- Time-off requests
- Handbook
- Handbook acknowledgement
- HR support / concerns
- Training module room
- Onboarding

No time clock. All employees are salary.

### Accounts

Includes account records and relationship data:

- Customer accounts
- Vendor accounts
- Contractor accounts
- Account history
- Account ownership

Financial transactions live in the Accounting Portal.

### Contacts

Includes:

- People connected to customers
- Vendor contacts
- Contractor contacts
- Internal contacts
- Project contacts
- Estimate contacts

### Erection Schedule

Includes:

- Crew planning
- Erection dates
- Field readiness
- Schedule conflicts
- Erection milestones

## Accounting Portal

Purpose: full financial control center.

Accounting is a top-level portal, separate from Employee, Vendor, and Customer.

Accounting owns:

- Billing
- Insurance
- Purchase Orders / POs
- Accounts receivable
- Accounts payable
- Customer invoices
- Vendor bills
- Subcontractor bills
- Payments received
- Payments due
- Schedule of Values / SOV
- Draws
- Deposits
- Change order billing
- Project financial health
- Financial reports and exports

PO creation, internal PO approval, and PO management belong inside the Accounting Portal.

Vendor-facing PO visibility can still be shown in the external Vendor Portal, but vendors do not control internal PO management.

Customer-facing billing visibility can still be shown in the external Customer Portal, but customers do not access the internal Accounting Portal.

## Vendor Portal

Purpose: outside vendor access.

Vendor Portal is outside the Employee Portal.

Vendors should see only:

- Assigned project/package
- PO visibility relevant to them
- Due dates
- Vendor packet files
- Upload slots
- Status notes

Vendors should not see internal employee modules or the internal Accounting Portal.

## Customer Portal

Purpose: outside customer access.

Customer Portal is outside the Employee Portal.

Customers should see only approved/assigned customer-facing items:

- Project status
- Approved quote
- Contract/change orders
- Customer-facing documents
- Payment/draw visibility
- Upload/request area
- Approvals

Customers should not see internal employee modules or the internal Accounting Portal.

## Architecture rule

When adding a new feature, first decide where it belongs:

- System management -> Admin Portal
- Internal operations -> Employee Portal
- Financial control -> Accounting Portal
- Outside vendor workflows -> Vendor Portal
- Outside customer workflows -> Customer Portal

Do not create a sixth top-level portal without an explicit architecture decision.
