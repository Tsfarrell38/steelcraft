# Database Schema Source of Truth

## Core tables

Existing app foundation includes:

- monday_boards
- monday_columns
- monday_items
- companies
- projects
- portal_activity_logs

## Estimating and Billing schema

These tables are live in PostgreSQL after `/api/estimating/schema/status` returned ok.

Tables:

- estimates
- estimate_cost_lines
- estimate_deposit_schedule
- quotation_versions
- quotation_lines
- project_checklist_items
- invoices
- invoice_lines
- schedule_of_values
- change_orders

Workbook-to-platform mapping:

```text
Project Info
  -> estimates

Working / Estimate Sheet
  -> estimate_cost_lines
  -> estimate_deposit_schedule

F&E Quotation / EO Quotation
  -> quotation_versions
  -> quotation_lines

Project Checklist
  -> project_checklist_items

Invoice
  -> invoices
  -> invoice_lines

Material SOV / Labor SOV
  -> schedule_of_values

CO1-CO10 / CO Totals
  -> change_orders
```

## HR schema

Added to code and wired into schema setup. Needs redeploy and `/api/setup/schema` or `/api/hr/schema/status` to confirm live.

Tables:

- employees
- pto_policies
- pto_balances
- pto_requests
- company_holidays
- handbook_documents
- handbook_acknowledgements
- onboarding_checklists
- onboarding_tasks
- training_courses
- training_lessons
- employee_training_assignments
- hr_concerns

## HR schema meaning

`employees`
- Salary employee records, departments, managers, start dates, anniversary tracking, PTO policy links, emergency contacts.

`pto_policies`
- PTO policy setup by salary employee group.

`pto_balances`
- Annual beginning/accrued/used/remaining PTO hours.

`pto_requests`
- PTO/time-off requests, dates, hours/days, reason, status, manager/admin review, approval/denial notes.

`company_holidays`
- Holiday calendar.

`handbook_documents`
- Employee handbook versions and links.

`handbook_acknowledgements`
- Employee signatures/acknowledgements by handbook version.

`onboarding_checklists`
- Employee onboarding list containers.

`onboarding_tasks`
- Onboarding checklist tasks.

`training_courses`
- Training portal courses, including software/process training.

`training_lessons`
- Course lessons/content.

`employee_training_assignments`
- Employee assignment/completion status.

`hr_concerns`
- Employee HR concerns, complaints, issue submissions, confidential flag, attachments, status, assigned reviewer, admin notes, and resolution notes.
