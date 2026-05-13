# Portal Module Map

## Admin Portal

Purpose: Control center for migration, users, roles, workflow settings, integrations, and schema setup.

Current functions:

- Health check
- Initialize database schema
- Sync Monday boards
- Load Monday board summary
- View database/Monday/storage status

Needed next:

- Role/module access settings
- User management
- Integration settings for Monday, Egnyte/Dropbox, email, e-signature, lead enrichment
- Workflow rule builder
- Audit log viewer

## Sales & Estimating Portal

Purpose: Convert the Excel estimate workbook logic into a platform flow.

Platform flow:

1. Estimate Intake
2. Scope Builder
3. Cost Build
4. Margin Review
5. Quote Generator
6. Project Checklist
7. Convert to Project
8. Billing/SOV/Change Orders

Must not look like a workbook.

## Project Portal

Purpose: Run jobs after quote/contract approval.

Stages:

- Contracted
- Engineering
- Material
- Fabrication
- Delivery
- Erection
- Punch
- Closeout

Connects to:

- Billing triggers
- Erection schedule
- Vendor packets
- Customer portal documents
- Egnyte/Dropbox project folders
- SOV/change order/invoice data

## Employee / Employer Room

Purpose: Employee-facing HR and training hub for salary employees.

Remove the time clock completely. Do not include punch-in/punch-out, shift tracking, payroll time capture, or time-clock widgets.

Priority items:

- Employee profile and salary employee record
- Start date
- Anniversary date or calculated work anniversary
- PTO balance and PTO tracking
- Time-off request form
- Time-off request history and approval status
- HR concerns / complaints / employee issues intake
- Employee handbook access
- Employee handbook acknowledgement/signature
- Training module room
- Assigned training modules
- Training completion tracking
- Safety acknowledgements, if applicable
- Employee documents

## HR Admin Portal

Purpose: Employer/admin side for employee records, PTO, holidays, onboarding, handbook, HR concerns, and training.

Priority items:

- Employee records
- Start date and anniversary tracking
- PTO tracker
- Time-off request review/approval
- Holiday calendar
- HR concern/complaint review and status tracking
- Onboarding checklist
- Employee handbook upload/versioning
- Employee handbook electronic acknowledgement/signature
- Training module management
- Software/process training
- Training completion tracking

## Customer Portal

Purpose: Customer-facing filtered view.

Customer should see only approved/assigned documents/statuses:

- Project status
- Approved quote
- Contract/change orders
- Customer-facing documents
- Payment/draw visibility
- Upload/request area
- Approvals

## Vendor Portal

Purpose: Vendor-specific assigned access.

Vendor should see only:

- Assigned project/package
- PO details
- Due dates
- Vendor packet files
- Upload slots
- Status notes

## Contractor Lead Intelligence Module

Purpose: Apollo-style lead system focused on general contractors and related commercial construction targets.

Clean approach:

- Company discovery
- Public business/company data
- Contact discovery
- Enrichment provider integration
- Email verification/confidence
- CRM/sales workflow

Fields:

- Company name
- Company type
- Website
- Phone
- City/county/state
- Service area
- Decision maker name
- Title
- Email
- Email confidence: verified / likely / unverified / role-based / main office only
- Source
- Outreach status
- Assigned salesperson
- Last contacted
- Next follow-up
- Notes
