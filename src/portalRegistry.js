export const canonicalPortals = [
  {
    id: 'admin',
    canonicalKey: 'core.admin',
    title: 'Admin',
    kind: 'Customer admin controls',
    description: 'Users, roles, portal access, customer-facing settings, and tenant administration.',
    route: '/portal/admin',
    package: 'core',
    scope: 'canonical'
  },
  {
    id: 'accounting',
    canonicalKey: 'core.accounting',
    title: 'Accounting',
    kind: 'Accounting workflow',
    description: 'AR, AP, invoices, bills, payments, chart of accounts, GL, reporting, retainage, and project financials.',
    route: '/portal/accounting',
    package: 'core',
    scope: 'canonical'
  },
  {
    id: 'contacts',
    canonicalKey: 'core.contacts',
    title: 'Contacts / CRM',
    kind: 'Relationships',
    description: 'Companies, customer contacts, vendor contacts, contractor contacts, project contacts, and account history.',
    route: '/portal/contacts',
    package: 'core',
    scope: 'canonical'
  },
  {
    id: 'hr',
    canonicalKey: 'core.hr',
    title: 'HR Portal',
    kind: 'Human resources',
    description: 'Salary employee records, PTO, handbook, HR support, onboarding, and training modules. No time clock.',
    route: '/portal/hr',
    package: 'core',
    scope: 'canonical'
  },
  {
    id: 'vendor',
    canonicalKey: 'core.vendor',
    title: 'Vendor Portal',
    kind: 'Outside vendors',
    description: 'Assigned packages, vendor-facing PO visibility, due dates, upload slots, and packet status.',
    route: '/portal/vendor',
    package: 'core',
    scope: 'canonical'
  },
  {
    id: 'customer',
    canonicalKey: 'core.customer',
    title: 'Customer Portal',
    kind: 'Outside customers',
    description: 'Approved project status, documents, quotes, contracts, change orders, payments, approvals, and uploads.',
    route: '/portal/customer',
    package: 'core',
    scope: 'canonical'
  },
  {
    id: 'employee',
    canonicalKey: 'core.employee',
    title: 'Employee Self-Service',
    kind: 'Employee access',
    description: 'Personal profile, PTO requests, handbook acknowledgements, training assignments, and employee documents.',
    route: '/portal/employee',
    package: 'core',
    scope: 'canonical'
  }
];

export const industryPacks = {
  metal_buildings: {
    id: 'metal_buildings',
    title: 'Metal Buildings',
    description: 'Industry-specific workflow pack for steel buildings, metal construction, fabrication, erection, and project delivery.',
    projectTable: 'metal_building_projects',
    canonicalProjectTable: 'projects',
    portals: [
      {
        id: 'sales',
        canonicalKey: 'metal_buildings.sales',
        title: 'Sales Portal',
        kind: 'Metal building sales',
        description: 'Leads, opportunities, customers, quote requests, handoff notes, and metal-building sales follow-up.',
        route: '/portal/sales',
        package: 'metal_buildings',
        scope: 'industry'
      },
      {
        id: 'estimating',
        canonicalKey: 'metal_buildings.estimating',
        title: 'Estimating Portal',
        kind: 'Metal building estimating',
        description: 'Estimate intake, scope builder, cost build, margin review, quote generation, workbook parsing, and bid handoff.',
        route: '/portal/estimating',
        package: 'metal_buildings',
        scope: 'industry'
      },
      {
        id: 'projects',
        canonicalKey: 'metal_buildings.projects',
        title: 'Projects Portal',
        kind: 'Metal building project execution',
        description: 'Contracted jobs, engineering, material, fabrication, delivery, erection schedule, punch, and closeout.',
        route: '/portal/projects',
        package: 'metal_buildings',
        scope: 'industry'
      },
      {
        id: 'planning',
        canonicalKey: 'metal_buildings.planning',
        title: 'Planning Portal',
        kind: 'Metal building operations planning',
        description: 'Job readiness, resource planning, schedule blockers, handoffs, production readiness, and field readiness.',
        route: '/portal/planning',
        package: 'metal_buildings',
        scope: 'industry'
      },
      {
        id: 'purchasing',
        canonicalKey: 'metal_buildings.purchasing',
        title: 'Purchasing Portal',
        kind: 'Metal building procurement',
        description: 'Purchase orders, vendor assignment, material purchasing, approvals, due dates, receiving, and project cost coding.',
        route: '/portal/purchasing',
        package: 'metal_buildings',
        scope: 'industry'
      }
    ]
  }
};

export const defaultTenantModuleMap = {
  tenantId: 'steelcraft-default',
  tenantName: 'Steel Craft',
  corePackage: 'core',
  industryPack: 'metal_buildings',
  enabledCanonicalPortals: canonicalPortals.map((portal) => portal.id),
  enabledIndustryPortals: industryPacks.metal_buildings.portals.map((portal) => portal.id)
};

export function getTenantPortals(moduleMap = defaultTenantModuleMap) {
  const industry = industryPacks[moduleMap.industryPack] || industryPacks.metal_buildings;
  const canonical = canonicalPortals.filter((portal) => moduleMap.enabledCanonicalPortals.includes(portal.id));
  const industryPortals = industry.portals.filter((portal) => moduleMap.enabledIndustryPortals.includes(portal.id));
  return [...canonical, ...industryPortals];
}

export function getPortalById(portalId, moduleMap = defaultTenantModuleMap) {
  return getTenantPortals(moduleMap).find((portal) => portal.id === portalId) || null;
}
