type SettlementBatch = {
  id: string;
  merchant: string;
  amount: string;
  status: "Ready" | "Review" | "Queued";
  due: string;
};

const batches: SettlementBatch[] = [
  {
    id: "STL-1048",
    merchant: "North Pier Foods",
    amount: "$28,430.18",
    status: "Ready",
    due: "Today"
  },
  {
    id: "STL-1049",
    merchant: "Orbit Supply",
    amount: "$16,802.41",
    status: "Review",
    due: "Today"
  },
  {
    id: "STL-1050",
    merchant: "Greenline Retail",
    amount: "$42,119.03",
    status: "Queued",
    due: "Tomorrow"
  }
];

const metrics = [
  { label: "Cleared today", value: "$87.4k", tone: "teal" },
  { label: "Pending review", value: "12", tone: "amber" },
  { label: "Failed payouts", value: "2", tone: "rose" }
];

function App() {
  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Primary">
        <div className="brand">
          <img src="/icon.svg" alt="" className="brand-mark" />
          <span>Yugain Settlement</span>
        </div>
        <div className="topbar-actions">
          <button type="button" aria-label="Search settlements">
            Search
          </button>
          <button type="button" className="primary-action">
            New batch
          </button>
        </div>
      </nav>

      <section className="workspace" aria-labelledby="workspace-title">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">Operations</p>
            <h1 id="workspace-title">Settlement control center</h1>
          </div>
          <p>
            Monitor payout readiness, review exceptions, and queue settlement batches
            for release.
          </p>
        </div>

        <section className="metrics" aria-label="Settlement summary">
          {metrics.map((metric) => (
            <article className="metric" data-tone={metric.tone} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </section>

        <section className="settlement-panel" aria-labelledby="batch-title">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Batch queue</p>
              <h2 id="batch-title">Ready for action</h2>
            </div>
            <button type="button">Export</button>
          </div>

          <div className="batch-table">
            <table aria-label="Settlement batches">
              <thead>
                <tr>
                  <th scope="col">Batch</th>
                  <th scope="col">Merchant</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Due</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id}>
                    <td>{batch.id}</td>
                    <td>{batch.merchant}</td>
                    <td>{batch.amount}</td>
                    <td>
                      <span className="status-pill" data-status={batch.status}>
                        {batch.status}
                      </span>
                    </td>
                    <td>{batch.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
