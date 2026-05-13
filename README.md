# Steel Craft Source of Truth

Generated: 2026-05-12
Project: Steel Craft Operations Portal
Repo/branch: Tsfarrell38/steelcraft - staging-lane-00-uiux

This package is the working source of truth for the Steel Craft portal build. It is not a final product spec; it is the current build direction, decisions, schema, module map, and implementation backlog.

## Current status

- DigitalOcean App Platform backend is running.
- PostgreSQL database is connected.
- Monday API environment variable is configured, but the current token does not appear to expose Steel Craft boards yet.
- Seth is expected to provide a Monday token with access to the real Steel Craft boards.
- Estimating/billing database tables are live.
- HR/PTO/handbook/onboarding/training schema has been added to code and needs redeploy + schema initialization to verify live tables.
- Sales & Estimating, Project, Employee, HR, Admin portal foundations exist in the UI.
- Remove the employee time clock entirely. All employees are salary, so the portal should not include punch-in/punch-out, payroll time capture, or time-clock screens.
- Employee/Employer Room priority is PTO, employee records, start date, anniversary, PTO tracking, time-off requests, HR concerns/complaints, employee handbook access/acknowledgement, and a strong training module room.

## High-level goal

Build a Steel Craft Operations Portal that replaces and extends Monday workflows, supports customer/vendor/internal portals, and creates a clean platform experience around estimating, project delivery, HR, training, files, documents, approvals, and lead intelligence.

## Product principle

Do not make the portal feel like a spreadsheet or workbook.
Use existing Excel and Monday logic behind the scenes, but expose it as a clean platform system with guided workflows, cards, records, approvals, and role-specific screens.

## Source of truth docs

The detailed build notes live in `steelcraft_source_of_truth/`, including module map, HR/training requirements, database schema, API endpoints, and next build steps.