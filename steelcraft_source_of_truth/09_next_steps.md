# Next Build Steps

## Immediate next steps

1. Redeploy coral-app after latest HR schema changes.
2. Run `/api/hr/schema/status` to verify HR tables are live.
3. Remove Employee time clock UI completely and update Employee/Employer Room around PTO, time-off requests, handbook, HR concerns, and training modules.
4. Update HR Admin UI to show employee records, start dates, anniversaries, PTO Tracker, Holiday Calendar, Handbook + Signature, HR concerns, Onboarding, and Training Portal.
5. When Seth provides Monday token, replace `MONDAY_API_TOKEN`, redeploy, and run migration start/summary.
6. Build create/read APIs for estimates, PTO requests, handbook acknowledgements, and training courses.
7. Build visible forms in the UI for Sales & Estimating and HR.

## Recommended build order

### Phase 1: Portal screens and schema

- Admin Portal
- Sales & Estimating Portal
- Project Portal
- HR Admin Portal
- Employee / Employer Room
- Vendor/Customer placeholders

### Phase 2: Real data flows

- Monday board import
- Estimate create/edit/list
- PTO/time-off request create/list/approve
- HR concerns/complaints create/list/review/resolve
- Handbook upload/acknowledgement
- Training modules/courses and assignments
- Project records from Monday/database

### Phase 3: Integrations

- Egnyte/Dropbox file system
- Email notifications
- E-signature provider if needed
- Lead enrichment provider

### Phase 4: Hardening

- Auth
- Role-based access
- Permissions per portal/module
- Audit logs everywhere
- File access protection
- Production logging
- Backups

## Decisions still open

- Egnyte vs Dropbox
- E-signature provider: DocuSign, Adobe Sign, Dropbox Sign, or built-in acknowledgement for non-legal approvals
- Lead enrichment provider
- Exact Monday board mappings
- Customer/vendor portal access model
- Final tenant branding and SaaS packaging
