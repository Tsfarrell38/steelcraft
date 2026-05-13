# White-Label / Brand Controls Source of Truth

## Hidden operator route

White-label controls live at:

```text
/brand
```

This route is intentionally hidden from the normal customer-facing application. It should not be linked from:

- Authentication page
- Admin Portal
- Employee Portal
- Vendor Portal
- Customer Portal

The purpose of `/brand` is internal operator configuration before a new customer/tenant is opened up.

## White-label rule

When opening the system for a new customer, do not load Steel Craft operating data.

A new customer should receive:

- Four-portal app structure
- Admin Portal shell
- Employee Portal shell
- Vendor Portal shell
- Customer Portal shell
- Employee module structure
- Planning Portal structure
- HR Portal structure
- Empty/clean tenant records
- Tenant-specific branding

A new customer should not receive:

- Steel Craft Monday boards
- Steel Craft Excel workbook data
- Steel Craft estimating workbook records
- Steel Craft employees
- Steel Craft customers
- Steel Craft vendors
- Steel Craft projects
- Steel Craft quotes
- Steel Craft POs
- Steel Craft billing records
- Steel Craft HR records

## Main brand controls

The `/brand` screen should control:

- Platform name
- Tenant/customer name
- Tenant slug
- Logo URL
- Custom domain
- Support email
- Primary color
- Accent color
- Enabled top-level portals
- Enabled Employee Portal modules
- Clean template setting
- Steel Craft data import toggles

## Default clean template settings

For any new tenant/customer:

```text
loadSteelCraftData = false
loadMondayBoards = false
loadExcelWorkbook = false
templateMode = clean-structure
```

## Architecture reminder

Top-level portals stay fixed:

1. Admin Portal
2. Employee Portal
3. Vendor Portal
4. Customer Portal

Billing, Insurance, and POs belong inside:

```text
Employee Portal > Planning Portal
```

Vendor and Customer portals stay outside the Employee Portal.

## Future database tables

The `/brand` screen currently establishes the control surface. The next backend hardening step is to persist these settings in PostgreSQL tables such as:

- tenants
- tenant_branding
- tenant_settings
- tenant_modules
- tenant_data_import_rules

Those tables should be separate from Steel Craft operational data.
