import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiSend } from './api.js';

const fallback = {
  employees: [{ id: 1, name: 'Avery Taylor', title: 'Project Manager', department: 'Operations', manager: 'Seth Farrell', employmentType: 'Salary', startDate: '2024-01-08', ptoBalance: 88, status: 'Active' }],
  ptoRequests: [],
  supportRequests: [],
  handbook: { id: 1, version: '2026.1', effectiveDate: '2026-05-13', title: 'Steel Craft Employee Handbook', acknowledgedBy: [] },
  training: [],
};

function employeeName(data, id) {
  return data.employees.find((employee) => employee.id === Number(id))?.name || 'Unknown employee';
}

function anniversary(startDate) {
  const date = new Date(`${String(startDate).slice(0, 10)}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
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
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState('Connecting to DigitalOcean PostgreSQL...');
  const [activeRoom, setActiveRoom] = useState('employee');
  const [activeEmployeeId, setActiveEmployeeId] = useState(1);

  async function refresh() {
    try {
      const next = await apiGet('/api/hr');
      setData(next);
      if (!next.employees?.length) setStatus('Backend connected. Add employees to begin.');
      else setStatus('Connected to DigitalOcean PostgreSQL');
      if (next.employees?.length && !next.employees.some((employee) => employee.id === Number(activeEmployeeId))) {
        setActiveEmployeeId(next.employees[0].id);
      }
    } catch (error) {
      setStatus(`Backend not ready: ${error.message}`);
      setData(fallback);
    }
  }

  useEffect(() => { refresh(); }, []);

  const activeEmployee = data.employees.find((employee) => employee.id === Number(activeEmployeeId)) || data.employees[0];
  const employeeTraining = useMemo(() => data.training.filter((course) => course.assignedTo?.includes(activeEmployee?.id)), [data.training, activeEmployee?.id]);
  const completedTraining = employeeTraining.filter((course) => course.completedBy?.includes(activeEmployee?.id)).length;
  const pendingPto = data.ptoRequests.filter((request) => request.status === 'Pending').length;
  const openSupport = data.supportRequests.filter((request) => request.status !== 'Resolved').length;

  async function submitPto(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiSend('/api/hr/pto/requests', 'POST', {
      employeeId: Number(form.get('employeeId')),
      type: form.get('type'),
      startDate: form.get('startDate'),
      endDate: form.get('endDate'),
      hours: Number(form.get('hours')),
      reason: form.get('reason'),
    });
    event.currentTarget.reset();
    await refresh();
  }

  async function submitSupport(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiSend('/api/hr/concerns', 'POST', {
      employeeId: Number(form.get('employeeId')),
      category: form.get('category'),
      summary: form.get('summary'),
    });
    event.currentTarget.reset();
    await refresh();
  }

  async function setPtoStatus(id, statusValue) {
    await apiSend(`/api/hr/pto/requests/${id}/${statusValue === 'Approved' ? 'approve' : 'deny'}`, 'POST', {});
    await refresh();
  }

  async function resolveSupport(id) {
    await apiSend(`/api/hr/concerns/${id}`, 'PATCH', { status: 'Resolved', resolution: 'Resolved by HR Admin' });
    await refresh();
  }

  async function acknowledgeHandbook() {
    await apiSend('/api/hr/handbook/acknowledge', 'POST', { employeeId: activeEmployee.id });
    await refresh();
  }

  async function completeTraining(courseId) {
    await apiSend(`/api/hr/training/assignments/${courseId}/complete`, 'PATCH', { employeeId: activeEmployee.id });
    await refresh();
  }

  async function addTraining(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiSend('/api/hr/training/modules', 'POST', {
      title: form.get('title'),
      category: form.get('category'),
      lessons: String(form.get('lessons')).split('\n').map((lesson) => lesson.trim()).filter(Boolean),
    });
    event.currentTarget.reset();
    await refresh();
  }

  const rooms = [['employee', 'Employee Room'], ['pto', 'PTO Tracker'], ['handbook', 'Handbook'], ['support', 'HR Support'], ['training', 'Training Room'], ['admin', 'HR Admin']];

  return (
    <main className="app-shell">
      <header className="hero"><div><Badge tone="red">Time clock removed</Badge><h1>Steel Craft HR Room</h1><p>DigitalOcean/PostgreSQL workflows for salary employees: PTO, handbook acknowledgement, HR support, training completion, employee records, start dates, and anniversaries.</p><p className="connection-status">{status}</p></div><aside className="hero-panel"><span>Active employee</span><select value={activeEmployee?.id || ''} onChange={(event) => setActiveEmployeeId(Number(event.target.value))}>{data.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select><small>{activeEmployee?.title} - {activeEmployee?.department}</small></aside></header>
      <nav className="room-tabs">{rooms.map(([id, label]) => <button key={id} className={activeRoom === id ? 'active' : ''} onClick={() => setActiveRoom(id)}>{label}</button>)}</nav>
      {activeEmployee && <div className="metrics-grid"><Card><span>Employment</span><strong>{activeEmployee.employmentType}</strong><small>No punch tracking</small></Card><Card><span>Start Date</span><strong>{String(activeEmployee.startDate).slice(0, 10)}</strong><small>Anniversary: {anniversary(activeEmployee.startDate)}</small></Card><Card><span>PTO Balance</span><strong>{activeEmployee.ptoBalance} hrs</strong><small>{pendingPto} pending requests</small></Card><Card><span>Training</span><strong>{completedTraining} / {employeeTraining.length}</strong><small>Completed modules</small></Card></div>}
      {activeRoom === 'employee' && <EmployeeRoom employee={activeEmployee} />}
      {activeRoom === 'pto' && <PtoRoom data={data} submitPto={submitPto} setPtoStatus={setPtoStatus} />}
      {activeRoom === 'handbook' && <HandbookRoom data={data} employee={activeEmployee} acknowledgeHandbook={acknowledgeHandbook} />}
      {activeRoom === 'support' && <SupportRoom data={data} submitSupport={submitSupport} resolveSupport={resolveSupport} />}
      {activeRoom === 'training' && <TrainingRoom data={data} employee={activeEmployee} completeTraining={completeTraining} addTraining={addTraining} />}
      {activeRoom === 'admin' && <AdminRoom data={data} openSupport={openSupport} pendingPto={pendingPto} />}
    </main>
  );
}

function EmployeeRoom({ employee }) {
  if (!employee) return null;
  return <Card><div className="section-heading"><Badge>Employee / Employer Room</Badge><h2>{employee.name}</h2><p>Salary employee profile with PTO, start date, anniversary, handbook, training, and HR support access.</p></div><div className="profile-grid"><div><span>Title</span><strong>{employee.title}</strong></div><div><span>Department</span><strong>{employee.department}</strong></div><div><span>Manager</span><strong>{employee.manager}</strong></div><div><span>Status</span><strong>{employee.status}</strong></div></div></Card>;
}

function PtoRoom({ data, submitPto, setPtoStatus }) {
  return <div className="two-column"><Card><div className="section-heading"><Badge>PTO Request</Badge><h2>Submit time off</h2></div><form onSubmit={submitPto} className="form-grid"><Field label="Employee"><select name="employeeId">{data.employees.map((employee) => <option value={employee.id} key={employee.id}>{employee.name}</option>)}</select></Field><Field label="Type"><select name="type"><option>PTO</option><option>Sick</option><option>Unpaid</option><option>Other</option></select></Field><Field label="Start"><input name="startDate" type="date" required /></Field><Field label="End"><input name="endDate" type="date" required /></Field><Field label="Hours"><input name="hours" type="number" min="1" required /></Field><Field label="Reason"><textarea name="reason" rows="3" required /></Field><button className="primary">Submit request</button></form></Card><Card><div className="section-heading"><Badge>Approval Queue</Badge><h2>PTO tracker</h2></div><div className="stack">{data.ptoRequests.map((request) => <article className="queue-item" key={request.id}><div><strong>{employeeName(data, request.employeeId)}</strong><p>{request.type}: {String(request.startDate).slice(0, 10)} to {String(request.endDate).slice(0, 10)} - {request.hours} hrs</p><Badge>{request.status}</Badge></div><div className="button-row"><button onClick={() => setPtoStatus(request.id, 'Approved')}>Approve</button><button onClick={() => setPtoStatus(request.id, 'Denied')}>Deny</button></div></article>)}</div></Card></div>;
}

function HandbookRoom({ data, employee, acknowledgeHandbook }) {
  const signed = data.handbook?.acknowledgedBy?.includes(employee?.id);
  return <Card><div className="section-heading"><Badge>Employee Handbook</Badge><h2>{data.handbook?.title || 'Employee Handbook'}</h2><p>Version {data.handbook?.version} effective {String(data.handbook?.effectiveDate || '').slice(0, 10)}</p></div><div className="document-box"><h3>Handbook acknowledgement</h3><p>Employees can review the current handbook version and acknowledge that they have received and read it.</p><Badge tone={signed ? 'green' : 'amber'}>{signed ? 'Acknowledged' : 'Needs acknowledgement'}</Badge>{!signed && <button className="primary" onClick={acknowledgeHandbook}>Acknowledge handbook</button>}</div></Card>;
}

function SupportRoom({ data, submitSupport, resolveSupport }) {
  return <div className="two-column"><Card><div className="section-heading"><Badge>HR Support</Badge><h2>Submit request</h2></div><form onSubmit={submitSupport} className="form-grid"><Field label="Employee"><select name="employeeId">{data.employees.map((employee) => <option value={employee.id} key={employee.id}>{employee.name}</option>)}</select></Field><Field label="Category"><select name="category"><option>Policy Question</option><option>Workplace Support</option><option>Benefits</option><option>Other</option></select></Field><Field label="Summary"><textarea name="summary" rows="5" required /></Field><button className="primary">Submit to HR</button></form></Card><Card><div className="section-heading"><Badge>HR Inbox</Badge><h2>Support queue</h2></div><div className="stack">{data.supportRequests.map((request) => <article className="queue-item" key={request.id}><div><strong>{employeeName(data, request.employeeId)}</strong><p>{request.category}: {request.summary}</p><Badge>{request.status}</Badge></div>{request.status !== 'Resolved' && <button onClick={() => resolveSupport(request.id)}>Resolve</button>}</article>)}</div></Card></div>;
}

function TrainingRoom({ data, employee, completeTraining, addTraining }) {
  return <div className="two-column wide-left"><Card><div className="section-heading"><Badge>Training Module Room</Badge><h2>Assigned training</h2></div><div className="module-grid">{data.training.filter((course) => course.assignedTo?.includes(employee?.id)).map((course) => { const done = course.completedBy?.includes(employee?.id); return <article className="module" key={course.id}><div><Badge>{course.category}</Badge><h3>{course.title}</h3><ul>{course.lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ul></div><button disabled={done} onClick={() => completeTraining(course.id)}>{done ? 'Completed' : 'Mark complete'}</button></article>; })}</div></Card><Card><div className="section-heading"><Badge>Admin</Badge><h2>Create module</h2></div><form onSubmit={addTraining} className="form-grid"><Field label="Title"><input name="title" required /></Field><Field label="Category"><input name="category" required /></Field><Field label="Lessons"><textarea name="lessons" rows="6" placeholder="One lesson per line" required /></Field><button className="primary">Add module</button></form></Card></div>;
}

function AdminRoom({ data, openSupport, pendingPto }) {
  return <Card><div className="section-heading"><Badge>HR Admin</Badge><h2>Employer controls</h2><p>Database-backed dashboard for employee records, PTO approvals, HR support, handbook acknowledgement, and training completion.</p></div><div className="stats-grid"><div className="stat"><span>Employees</span><strong>{data.employees.length}</strong><small>All salary</small></div><div className="stat"><span>Pending PTO</span><strong>{pendingPto}</strong><small>Awaiting review</small></div><div className="stat"><span>Open HR Support</span><strong>{openSupport}</strong><small>Needs follow-up</small></div><div className="stat"><span>Handbook Signed</span><strong>{data.handbook?.acknowledgedBy?.length || 0}/{data.employees.length}</strong><small>Current version</small></div></div><div className="employee-table">{data.employees.map((employee) => <div key={employee.id}><strong>{employee.name}</strong><span>{employee.title}</span><span>Start: {String(employee.startDate).slice(0, 10)}</span><span>Anniversary: {anniversary(employee.startDate)}</span><span>PTO: {employee.ptoBalance} hrs</span></div>)}</div></Card>;
}

export default App;
