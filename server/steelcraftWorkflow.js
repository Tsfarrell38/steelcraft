function parseSettings(settings) {
  if (!settings) return {};
  if (typeof settings === 'object') return settings;
  try {
    return JSON.parse(settings);
  } catch {
    return {};
  }
}

function columnLabels(column) {
  const settings = parseSettings(column.settings_str || column.settings);
  const labels = settings.labels || {};
  if (Array.isArray(labels)) return labels.filter(Boolean).map(String);
  return Object.values(labels).filter(Boolean).map(String);
}

function simplifyColumn(column) {
  return {
    sourceId: column.id,
    sourceTitle: column.title,
    sourceType: column.type,
    labels: columnLabels(column)
  };
}

function classifyBoard(board) {
  const name = String(board.name || '').toLowerCase();
  const columns = board.columns || [];
  const columnText = columns.map((column) => `${column.title} ${column.type} ${columnLabels(column).join(' ')}`).join(' ').toLowerCase();

  if (name.includes('job') || columnText.includes('rfi') || columnText.includes('punch list') || columnText.includes('submittal')) return 'project_execution';
  if (name.includes('erg') || columnText.includes('garage door') || columnText.includes('steel') || columnText.includes('concrete')) return 'erection_readiness';
  if (name.includes('training')) return 'training_support';
  if (name.includes('whitecap')) return 'field_supplier_coordination';
  return 'operations_workflow';
}

function inferField(column) {
  const title = String(column.title || '').toLowerCase();
  const type = String(column.type || '').toLowerCase();
  const labels = columnLabels(column).join(' ').toLowerCase();

  if (title === 'name') return { field: 'work_item_name', label: 'Work item', module: 'workflow' };
  if (type === 'people' || title.includes('owner')) return { field: 'responsible_person', label: 'Responsible person', module: 'assignment' };
  if (title.includes('due')) return { field: 'due_date', label: 'Due date', module: 'schedule' };
  if (title.includes('date')) return { field: 'date', label: 'Date', module: 'schedule' };
  if (title.includes('status') && labels.includes('approved')) return { field: 'approval_status', label: 'Approval status', module: 'approval' };
  if (title.includes('status')) return { field: 'workflow_status', label: 'Workflow status', module: 'workflow' };
  if (title.includes('type') || labels.includes('inspection') || labels.includes('permitting') || labels.includes('rfi')) return { field: 'workflow_type', label: 'Workflow type', module: 'classification' };
  if (title.includes('category') || title.includes('trade') || labels.includes('mechanical') || labels.includes('electrical')) return { field: 'trade_category', label: 'Trade/category', module: 'classification' };
  if (type === 'numbers') return { field: 'quantity_or_reference_number', label: 'Number', module: 'tracking' };
  if (type === 'last_updated') return { field: 'last_activity_at', label: 'Last activity', module: 'audit' };
  if (type === 'dropdown') return { field: 'controlled_option', label: column.title, module: 'classification' };
  return { field: column.id, label: column.title, module: 'custom' };
}

function buildSteps(board) {
  const columns = board.columns || [];
  const statusLabels = columns.flatMap((column) => column.type === 'status' ? columnLabels(column) : []);
  const typeLabels = columns.flatMap((column) => /type|category|trade/i.test(column.title || '') ? columnLabels(column) : []);

  const normalizedStatuses = statusLabels.map((label) => String(label).toLowerCase());
  const steps = [];

  if (normalizedStatuses.some((label) => label.includes('submitted'))) steps.push({ key: 'submitted', label: 'Submitted', source: 'status label' });
  if (normalizedStatuses.some((label) => label.includes('action') || label.includes('pending'))) steps.push({ key: 'needs_action', label: 'Needs action', source: 'status label' });
  if (normalizedStatuses.some((label) => label.includes('inspection'))) steps.push({ key: 'inspection', label: 'Inspection', source: 'type/status label' });
  if (normalizedStatuses.some((label) => label.includes('rfi'))) steps.push({ key: 'rfi', label: 'RFI / question', source: 'type/status label' });
  if (normalizedStatuses.some((label) => label.includes('punch'))) steps.push({ key: 'punch', label: 'Punch item', source: 'type/status label' });
  if (normalizedStatuses.some((label) => label.includes('done') || label.includes('approved'))) steps.push({ key: 'complete', label: 'Complete / approved', source: 'status label' });
  if (normalizedStatuses.some((label) => label.includes('not ready') || label.includes('not approved'))) steps.push({ key: 'blocked', label: 'Blocked / not ready', source: 'status label' });

  if (!steps.length) {
    steps.push(
      { key: 'intake', label: 'Intake', source: 'default' },
      { key: 'assign', label: 'Assign owner', source: 'default' },
      { key: 'track', label: 'Track status/date', source: 'default' },
      { key: 'complete', label: 'Complete', source: 'default' }
    );
  }

  return {
    steps,
    categories: Array.from(new Set(typeLabels)).filter(Boolean).slice(0, 80)
  };
}

function destinationForClassification(classification) {
  switch (classification) {
    case 'project_execution':
      return { portal: 'Projects Portal', workspace: 'Project Workflow', lane: 'Execution / RFIs / Punch / Submittals' };
    case 'erection_readiness':
      return { portal: 'Projects Portal', workspace: 'Erection Readiness', lane: 'Readiness / trades / site work' };
    case 'field_supplier_coordination':
      return { portal: 'Planning Portal', workspace: 'Supplier Coordination', lane: 'Material and vendor coordination' };
    case 'training_support':
      return { portal: 'HR Portal', workspace: 'Training', lane: 'Training support workflow' };
    default:
      return { portal: 'Planning Portal', workspace: 'Operations Workflow', lane: 'General workflow tracking' };
  }
}

export function mapMondayBoardsToSteelCraftWorkflow(boards = []) {
  const workflowBoards = boards
    .filter((board) => !String(board.name || '').toLowerCase().startsWith('subitems of'))
    .map((board) => {
      const classification = classifyBoard(board);
      const destination = destinationForClassification(classification);
      const stepData = buildSteps(board);
      const fieldMap = (board.columns || []).map((column) => ({
        ...simplifyColumn(column),
        ...inferField(column)
      }));

      return {
        sourceBoardId: board.id,
        sourceBoardName: board.name,
        internalName: destination.workspace,
        classification,
        destination,
        summary: {
          workspaceName: board.workspace?.name || null,
          boardKind: board.board_kind,
          state: board.state,
          columnCount: (board.columns || []).length,
          statusCount: fieldMap.filter((field) => field.sourceType === 'status').length,
          peopleFields: fieldMap.filter((field) => field.sourceType === 'people').length,
          dateFields: fieldMap.filter((field) => field.sourceType === 'date').length
        },
        workflow: {
          steps: stepData.steps,
          categories: stepData.categories
        },
        fieldMap,
        verificationChecklist: [
          { key: 'names_hidden', label: 'Do not show this as a Monday board in the ERP UI', status: 'required' },
          { key: 'steelcraft_names', label: 'Use Steel Craft workflow names and portal destinations', status: 'required' },
          { key: 'owners_mapped', label: 'Owner/people columns map to responsible person', status: fieldMap.some((field) => field.field === 'responsible_person') ? 'mapped' : 'missing' },
          { key: 'status_mapped', label: 'Status columns map to Steel Craft workflow status/approval', status: fieldMap.some((field) => field.field.includes('status')) ? 'mapped' : 'missing' },
          { key: 'dates_mapped', label: 'Date/due date columns map to schedule fields', status: fieldMap.some((field) => field.module === 'schedule') ? 'mapped' : 'missing' },
          { key: 'categories_mapped', label: 'Type/trade/category values map to internal categories', status: stepData.categories.length ? 'mapped' : 'review' },
          { key: 'excel_separate', label: 'Keep Excel quote engine separate from this workflow source', status: 'required' }
        ]
      };
    });

  return {
    ok: true,
    source: 'monday_api',
    uiName: 'Steel Craft Workflow Source',
    instruction: 'Use this as source mapping only. Do not render the ERP as a Monday board.',
    boardCount: boards.length,
    mappedWorkflowCount: workflowBoards.length,
    workflows: workflowBoards,
    reviewOrder: workflowBoards.map((item) => ({
      id: item.sourceBoardId,
      internalName: item.internalName,
      destination: item.destination,
      check: item.verificationChecklist
    }))
  };
}
