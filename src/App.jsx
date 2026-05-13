import React, { useMemo, useState } from 'react';

const STORAGE_KEY = 'steelcraft_hr_room_v1';

const seed = {
  employees: [
    { id: 1, name: 'Avery Taylor', title: 'Project Manager', department: 'Operations', manager: 'Seth Farrell', employmentType: 'Salary', startDate: '2024-01-08', ptoBalance: 88, status: 'Active' },
    { id: 2, name: 'Jordan Lee', title: 'Estimator', department: 'Sales & Estimating', manager: 'Seth Farrell', employmentType: 'Salary', startDate: '2023-08-21', ptoBalance: 64, status: 'Active' },
    { id: 3, name: 'Morgan Wells', title: 'Shop Lead', department: 'Fabrication', manager: 'Seth Farrell', employmentType: 'Salary', startDate: '2022-03-14', ptoBalance: 112, status: 'Active' },
  ],
  ptoRequests: [
    { id: 101, employeeId: 1, type: 'PTO', startDate: '2026-05-27', endDate: '2026-05-28', hours: 16, reason: 'Family trip', status: 'Pending', adminNote: '' },
    { id: 102, employeeId: 2, type: 'Sick', startDate: '2026-05-14', endDate: '2026-05-14', hours: 8, reason: 'Doctor appointment', status: 'Approved', adminNote: 'Covered.' },
  ],
  supportRequests: [
    { id: 201, employeeId: 3, category: 'Policy Question', summary: 'Question about PTO rollover', status: 'Open', assignedTo: 'HR Admin', resolution: '' },
  ],
  handbook: { version: '2026.1', effectiveDate: '2026-05-13', title: 'Steel Craft Employee Handbook', acknowledgedBy: [2] },
  training: [
    { id: 301, title: 'Company Process', category: 'Process', lessons: ['Portal overview', 'Internal communication', 'Daily project flow'], assignedTo: [1, 2, 3], completedBy: [2] },
    { id: 302, title: 'Safety', category: 'Safety', lessons: ['Jobsite basics', 'Shop safety', 'Incident reporting'], assignedTo: [1, 3], completedBy: [] },
    { id: 303, title: 'Software', category: 'Software', lessons: ['Monday workflows', 'Portal records', 'File procedures'], assignedTo: [1, 2], completedBy: [1] },
    { id: 304, title: 'Estimating Workflow', category: 'Estimating', lessons: ['Estimate intake', 'Scope builder', 'Quote handoff'], assignedTo: [2], completedBy: [] },
  ],
};

function loadState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seed;
  } catch {
    return seed;
  }
}

function saveState(next) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function employeeName(data, id) {
  return data.employees.find((employee) => employee.id === Number(id))?.name || 'Unknown employee';
}

function anniversary(startDate) {
  const date = new Date(`${startDate}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

function nextId(items) {
  return Math.max(0, ...items.map((item) => item.id)) + 1;
}

function Badge({ children, tone = 'dark' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function App() {
  const [data, setData] = useState(loadState);
  const [activeRoom, setActiveRoom] = useState('employee');
  const [activeEmployeeId, setActiveEmployeeId] = useState(1);
  const activeEmployee = data.employees.find((employee) => employee.id === Number(activeEmployeeId)) || data.employees[0];

  const employeeTraining = useMemo(() => data.training.filter((course) => course.assignedTo.includes(activeEmployee.id)), [data.training, activeEmployee.id]);
  const completedTraining = employeeTraining.filter((course) => course.completedBy.includes(activeEmployee.id)).length;
  const pendingPto = data.ptoRequests.filter((request) => request.status === 'Pending').length;
  const openSupport = data.supportRequests.filter((request) => request.status !== 'Resolved').length;

  function update(mutator) {
    setData((current) => saveState(mutator(structuredClone(current))));
  }

  function submitPto(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    update((draft) => {
      draft.ptoRequests.unshift({
        id: nextId(draft.ptoRequests),
        employeeId: Number(form.get('employeeId')),
        type: form.get('type'),
        startDate: form.get('startDate'),
        endDate: form.get('endDate'),
        hours: Number(form.get('hours')),
        reason: form.get('reason'),
        status: 'Pending',
        adminNote: '',
      });
      return draft;
    });
    event.currentTarget.reset();
  }

  function submitSupport(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    update((draft) => {
      draft.supportRequests.unshift({
        id: nextId(draft.supportRequests),
        employeeId: Number(form.get('employeeId')),
        category: form.get('category'),
        summary: form.get('summary'),
        status: 'Open',
        assignedTo: 'HR Admin',
        resolution: '',
      });
      return draft;
    });
    event.currentTarget.reset();
  }

  function setPtoStatus(id, status) {
    update((draft) => {
      const request = draft.ptoRequests.find((item) => item.id === id);
      if (request) request.status = status;
      return draft;
    });
  }

  function resolveSupport(id) {
    update((draft) => {
      const request = draft.supportRequests.find((item) => item.id === id);
      if (request) {
        request.status = 'Resolved';
        request.resolution = 'Resolved by HR Admin';
      }
      return draft;
    });
  }

  function acknowledgeHandbook() {
    update((draft) => {
      if (!draft.handbook.acknowledgedBy.includes(activeEmployee.id)) draft.handbook.acknowledgedBy.push(activeEmployee.id);
      return draft;
    });
  }

  function completeTraining(courseId) {
    update((draft) => {
      const course = draft.training.find((item) => item.id === courseId);
      if (course && !course.completedBy.includes(activeEmployee.id)) course.completedBy.push(activeEmployee.id);
      return draft;
    });
  }

  function addTraining(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    update((draft) => {
      draft.training.push({
        id: nextId(draft.training),
        title: form.get('title'),
        category: form.get('category'),
        lessons: String(form.get('lessons')).split('\n').map((lesson) => lesson.trim()).filter(Boolean),
        assignedTo: draft.employees.map((employee) => employee.id),
        completedBy: [],
      });
      return draft;
    });
    event.currentTarget.reset();
  }

  const rooms = [
    ['employee', 'Employee Room'],
    ['pto', 'PTO Tracker'],
    ['handbook', 'Handbook'],
    ['support', 'HR Support'],
    ['training', 'Training Room'],
    ['admin', 'HR Admin'],
  ];

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <Badge tone="red">Time clock removed</Badge>
          <h1>Steel Craft HR Room</h1>
          <p>Live front-end workflows for salary employees: PTO, handbook acknowledgement, HR support, training completion, employee records, start dates, and anniversaries.</p>
        </div>
        <aside className="hero-panel">
          <span>Active employee</span>
          <select value={activeEmployeeId} onChange={(event) => setActiveEmployeeId(Number(event.target.value))}>
            {data.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
          </select>
          <small>{activeEmployee.title} - {activeEmployee.department}</small>
        </aside>
      </header>

      <nav className="room-tabs">
        {rooms.map(([id, label]) => <button key={id} className={activeRoom === id ? 'active' : ''} onClick={() => setActiveRoom(id)}>{label}</button>)}
      </nav>

      <div className="metrics-grid">
        <Card><span>Employment</span><strong>{activeEmployee.employmentType}</strong><small>No punch tracking</small></Card>
        <Card><span>Start Date</span><strong>{activeEmployee.startDate}</strong><small>Anniversary: {anniversary(activeEmployee.startDate)}</small></Card>
        <Card><span>PTO Balance</span><strong>{activeEmployee.ptoBalance} hrs</strong><small>{pendingPto} pending requests</small></Card>
        <Card><span>Training</span><strong>{completedTraining} / {employeeTraining.length}</strong><small>Completed modules</small></Card>
      </div>

      {activeRoom === 'employee' && <EmployeeRoom employee={activeEmployee} data={data} />}
      {activeRoom === 'pto' && <PtoRoom data={data} submitPto={submitPto} setPtoStatus={setPtoStatus} />}
      {activeRoom === 'handbook' && <HandbookRoom data={data} employee={activeEmployee} acknowledgeHandbook={acknowledgeHandbook} />}
      {activeRoom === 'support' && <SupportRoom data={data} submitSupport={submitSupport} resolveSupport={resolveSupport} />}
      {activeRoom === 'training' && <TrainingRoom data={data} employee={activeEmployee} completeTraining={completeTraining} addTraining={addTraining} />}
      {activeRoom === 'admin' && <AdminRoom data={data} openSupport={openSupport} pendingPto={pendingPto} />}
    </main>
  );
}

function EmployeeRoom({ employee, data }) {
  return <Card><div className="section-heading"><Badge>Employee / Employer Room</Badge><h2>{employee.name}</h2><p>Salary employee profile with PTO, start date, anniversary, handbook, training, and HR support access.</p></div><div className="profile-grid"><div><span>Title</span><strong>{employee.title}</strong></div><div><span>Department</span><strong>{employee.department}</strong></div><div><span>Manager</span><strong>{employee.manager}</strong></div><div><span>Status</span><strong>{employee.status}</strong></div></div><div className="quick-actions"><button>Request Time Off</button><button>Open Handbook</button><button>Open Training</button><button>Submit HR Support</button></div></Card>;
}

function PtoRoom({ data, submitPto, setPtoStatus }) {
  return <div className="two-column"><Card><div className="section-heading"><Badge>PTO Request</Badge><h2>Submit time off</h2></div><form onSubmit={submitPto} className="form-grid"><Field label="Employee"><select name="employeeId">{data.employees.map((employee) => <option value={employee.id} key={employee.id}>{employee.name}</option>)}</select></Field><Field label="Type"><select name="type"><option>PTO</option><option>Sick</option><option>Unpaid</option><option>Other</option></select></Field><Field label="Start"><input name="startDate" type="date" required /></Field><Field label="End"><input name="endDate" type="date" required /></Field><Field label="Hours"><input name="hours" type="number" min="1" required /></Field><Field label="Reason"><textarea name="reason" rows="3" required /></Field><button className="primary">Submit request</button></form></Card><Card><div className="section-heading"><Badge>Approval Queue</Badge><h2>PTO tracker</h2></div><div className="stack">{data.ptoRequests.map((request) => <article className="queue-item" key={request.id}><div><strong>{employeeName(data, request.employeeId)}</strong><p>{request.type}: {request.startDate} to {request.endDate} - {request.hours} hrs</p><Badge>{request.status}</Badge></div><div className="button-row"><button onClick={() => setPtoStatus(request.id, 'Approved')}>Approve</button><button onClick={() => setPtoStatus(request.id, 'Denied')}>Deny</button></div></article>)}</div></Card></div>;
}

function HandbookRoom({ data, employee, acknowledgeHandbook }) {
  const signed = data.handbook.acknowledgedBy.includes(employee.id);
  return <Card><div className="section-heading"><Badge>Employee Handbook</Badge><h2>{data.handbook.title}</h2><p>Version {data.handbook.version} effective {data.handbook.effectiveDate}</p></div><div className="document-box"><h3>Handbook acknowledgement</h3><p>Employees can review the current handbook version and acknowledge that they have received and read it.</p><Badge tone={signed ? 'green' : 'amber'}>{signed ? 'Acknowledged' : 'Needs acknowledgement'}</Badge>{!signed && <button className="primary" onClick={acknowledgeHandbook}>Acknowledge handbook</button>}</div></Card>;
}

function SupportRoom({ data, submitSupport, resolveSupport }) {
  return <div className="two-column"><Card><div className="section-heading"><Badge>HR Support</Badge><h2>Submit request</h2></div><form onSubmit={submitSupport} className="form-grid"><Field label="Employee"><select name="employeeId">{data.employees.map((employee) => <option value={employee.id} key={employee.id}>{employee.name}</option>)}</select></Field><Field label="Category"><select name="category"><option>Policy Question</option><option>Workplace Support</option><option>Benefits</option><option>Other</option></select></Field><Field label="Summary"><textarea name="summary" rows="5" required /></Field><button className="primary">Submit to HR</button></form></Card><Card><div className="section-heading"><Badge>HR Inbox</Badge><h2>Support queue</h2></div><div className="stack">{data.supportRequests.map((request) => <article className="queue-item" key={request.id}><div><strong>{employeeName(data, request.employeeId)}</strong><p>{request.category}: {request.summary}</p><Badge>{request.status}</Badge></div>{request.status !== 'Resolved' && <button onClick={() => resolveSupport(request.id)}>Resolve</button>}</article>)}</div></Card></div>;
}

function TrainingRoom({ data, employee, completeTraining, addTraining }) {
  return <div className="two-column wide-left"><Card><div className="section-heading"><Badge>Training Module Room</Badge><h2>Assigned training</h2></div><div className="module-grid">{data.training.filter((course) => course.assignedTo.includes(employee.id)).map((course) => { const done = course.completedBy.includes(employee.id); return <article className="module" key={course.id}><div><Badge>{course.category}</Badge><h3>{course.title}</h3><ul>{course.lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ul></div><button disabled={done} onClick={() => completeTraining(course.id)}>{done ? 'Completed' : 'Mark complete'}</button></article>; })}</div></Card><Card><div className="section-heading"><Badge>Admin</Badge><h2>Create module</h2></div><form onSubmit={addTraining} className="form-grid"><Field label="Title"><input name="title" required /></Field><Field label="Category"><input name="category" required /></Field><Field label="Lessons"><textarea name="lessons" rows="6" placeholder="One lesson per line" required /></Field><button className="primary">Add module</button></form></Card></div>;
}

function AdminRoom({ data, openSupport, pendingPto }) {
  return <Card><div className="section-heading"><Badge>HR Admin</Badge><h2>Employer controls</h2><p>Live dashboard for employee records, PTO approvals, HR support, handbook acknowledgement, and training completion.</p></div><div className="stats-grid"><div className="stat"><span>Employees</span><strong>{data.employees.length}</strong><small>All salary</small></div><div className="stat"><span>Pending PTO</span><strong>{pendingPto}</strong><small>Awaiting review</small></div><div className="stat"><span>Open HR Support</span><strong>{openSupport}</strong><small>Needs follow-up</small></div><div className="stat"><span>Handbook Signed</span><strong>{data.handbook.acknowledgedBy.length}/{data.employees.length}</strong><small>Current version</small></div></div><div className="employee-table">{data.employees.map((employee) => <div key={employee.id}><strong>{employee.name}</strong><span>{employee.title}</span><span>Start: {employee.startDate}</span><span>Anniversary: {anniversary(employee.startDate)}</span><span>PTO: {employee.ptoBalance} hrs</span></div>)}</div></Card>;
}

export default App;
