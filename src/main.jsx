import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const stats = [
  ['Employment Type', 'Salary', 'No time clock or punch tracking'],
  ['Start Date', 'Jan 8, 2024', 'Anniversary tracked automatically'],
  ['PTO Balance', '88 hrs', '16 hrs pending approval'],
  ['Training', '6 / 8', 'Two modules assigned'],
];

const employeeTools = [
  ['Request Time Off', 'Submit PTO, sick, unpaid, or other time-off requests for manager review.'],
  ['Employee Handbook', 'View the active handbook and sign acknowledgement for the current version.'],
  ['HR Support Request', 'Submit employee concerns or workplace support requests for HR review.'],
  ['Training Modules', 'Complete assigned company process, software, safety, estimating, and project workflow training.'],
];

const adminTools = [
  ['Employee Records', 'Start dates, anniversaries, salary employee profiles, PTO policies, and active status.'],
  ['PTO Approval Queue', 'Review requests, approve or deny, and track used and remaining PTO balances.'],
  ['HR Support Inbox', 'Review employee support requests, assign reviewers, track status, and record resolution notes.'],
  ['Training Management', 'Build modules, assign training, and monitor acknowledgements and completion.'],
];

const requests = [
  ['Avery Taylor', 'PTO', 'May 27-28', '16', 'Pending'],
  ['Jordan Lee', 'Sick', 'May 14', '8', 'Approved'],
  ['Morgan Wells', 'PTO', 'Jun 17-20', '32', 'Needs Review'],
];

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function App() {
  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <Badge>Time clock removed</Badge>
          <h1>Steel Craft Operations Portal</h1>
          <p>Employee tools are now HR-first for salary employees: PTO, start dates, anniversaries, handbook, training, and HR support.</p>
        </div>
        <aside className="hero-panel">
          <span>Current roadmap priority</span>
          <strong>Employee / Employer Room</strong>
          <small>Replace time clock with PTO and HR workflows</small>
        </aside>
      </header>

      <Card className="employee-room">
        <div className="section-heading">
          <Badge>Employee / Employer Room</Badge>
          <h2>Salary employee HR hub</h2>
          <p>No time clock. No punch-in/punch-out. This room is for PTO, HR support, handbook, training, and employee records.</p>
        </div>

        <div className="stats-grid">
          {stats.map(([label, value, detail]) => (
            <div className="stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </div>
          ))}
        </div>

        <div className="action-grid">
          {employeeTools.map(([title, copy]) => (
            <article className="action-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </Card>

      <div className="two-column">
        <Card>
          <div className="section-heading compact">
            <Badge>HR Admin</Badge>
            <h2>Employer room controls</h2>
          </div>
          <div className="admin-list">
            {adminTools.map(([title, detail]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <div className="section-heading compact">
            <Badge>PTO Tracker</Badge>
            <h2>Time-off requests</h2>
          </div>
          <div className="table">
            <div className="table-row table-head"><span>Employee</span><span>Type</span><span>Dates</span><span>Hours</span><span>Status</span></div>
            {requests.map((row) => (
              <div className="table-row" key={row.join('-')}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="training-card">
        <div className="section-heading compact">
          <Badge>Training Module Room</Badge>
          <h2>Training library</h2>
          <p>Company process, safety, software, estimating workflow, project delivery, file procedures, and customer/vendor communication.</p>
        </div>
        <div className="module-grid">
          {['Company Process', 'Safety', 'Software', 'Estimating Workflow', 'Project Delivery', 'File Procedures'].map((module) => (
            <div className="module" key={module}><strong>{module}</strong><span>Active</span></div>
          ))}
        </div>
      </Card>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
