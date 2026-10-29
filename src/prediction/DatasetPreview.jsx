import { useDeferredValue, useMemo, useState } from "react";
import { Download, Filter, RefreshCw, Search } from "lucide-react";
import DataReadinessReport from "./DataReadinessReport.jsx";

const TABLE_COLUMNS = [
  "employee_key",
  "role_code",
  "cycle_id",
  "checkpoint_index",
  "elapsed_fraction",
  "current_overall_score",
  "final_approved_score",
  "is_synthetic",
];

const pretty = (value) => value === null || value === undefined || value === "" ? "—" : String(value);
const range = (value) => value ? `${value.minimum}–${value.maximum}` : "Not available";

function optionsFor(rows, field) {
  return [...new Set(rows.map((row) => row[field]).filter((value) => value !== null && value !== undefined && value !== ""))].sort();
}

export default function DatasetPreview({
  generated,
  selectedDataset,
  readiness,
  readinessLoading,
  onSelectDataset,
  onDownloadCsv,
  onDownloadMetadata,
  onConfigure,
}) {
  const dataset = generated.datasets[selectedDataset];
  const rows = dataset.rows;
  const [role, setRole] = useState("");
  const [cycle, setCycle] = useState("");
  const [checkpoint, setCheckpoint] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const roles = useMemo(() => optionsFor(rows, "role_code"), [rows]);
  const cycles = useMemo(() => optionsFor(rows, "cycle_id"), [rows]);
  const checkpoints = useMemo(() => optionsFor(rows, "checkpoint_index"), [rows]);
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (role && row.role_code !== role) return false;
    if (cycle && row.cycle_id !== cycle) return false;
    if (checkpoint && String(row.checkpoint_index) !== checkpoint) return false;
    if (deferredSearch && !String(row.employee_key).toLowerCase().includes(deferredSearch)) return false;
    return true;
  }), [rows, role, cycle, checkpoint, deferredSearch]);
  const visibleRows = filteredRows.slice(0, 25);

  return (
    <section className="prediction-page-section" aria-labelledby="dataset-preview-title">
      <div className="prediction-section-heading">
        <div>
          <span className="prediction-kicker">SCREEN 3 · DATASET PREVIEW AND READINESS</span>
          <h1 id="dataset-preview-title">Inspect the generated data before training.</h1>
          <p>Filters affect only this preview. Readiness always evaluates the complete frozen scenario.</p>
        </div>
        <div className="prediction-action-row">
          <button className="prediction-btn" onClick={onConfigure}><RefreshCw size={15} />Regenerate</button>
          <button className="prediction-btn" onClick={onDownloadMetadata}><Download size={15} />Metadata</button>
          <button className="prediction-btn primary" onClick={onDownloadCsv}><Download size={15} />Download CSV</button>
        </div>
      </div>

      <div className="prediction-dataset-tabs" role="tablist" aria-label="Synthetic datasets">
        {Object.values(generated.datasets).map((entry) => (
          <button
            key={entry.id}
            role="tab"
            aria-selected={entry.id === selectedDataset}
            className={entry.id === selectedDataset ? "active" : ""}
            onClick={() => onSelectDataset(entry.id)}
          >
            <span>{entry.label}</span>
            <small>{entry.summary.rows} rows</small>
          </button>
        ))}
      </div>

      <div className="prediction-preview-layout">
        <div className="prediction-table-card">
          <div className="prediction-table-summary">
            <div><span>Rows</span><strong>{dataset.summary.rows}</strong></div>
            <div><span>Employees</span><strong>{dataset.summary.employees}</strong></div>
            <div><span>Cycles</span><strong>{dataset.summary.cycles.length}</strong></div>
            <div><span>Completed cases</span><strong>{dataset.summary.completedCases}</strong></div>
            <div><span>Fields</span><strong>{generated.columns.length}</strong></div>
          </div>
          <div className="prediction-data-profile" aria-label="Dataset coverage and quality summary">
            <div><span>Cycle coverage</span><strong>{dataset.summary.cycles.join(", ")}</strong></div>
            <div><span>Checkpoints</span><strong>{dataset.profile.checkpointIndices.join(", ") || "—"}</strong></div>
            <div><span>Current score range</span><strong>{range(dataset.profile.currentScoreRange)}</strong></div>
            <div><span>Final score range</span><strong>{range(dataset.profile.targetScoreRange)}</strong></div>
            <div><span>Missing-value rows</span><strong>{dataset.profile.missingValueRows}</strong></div>
            <div><span>Duplicate rows</span><strong>{dataset.profile.duplicateRows}</strong></div>
            <div><span>Rejected by readiness</span><strong>{readiness?.counts?.rejectedRows ?? "—"}</strong></div>
          </div>

          <div className="prediction-filters">
            <label className="prediction-search"><Search size={15} /><span className="sr-only">Search employee key</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search synthetic employee" /></label>
            <label><Filter size={14} /><span className="sr-only">Filter role</span><select value={role} onChange={(event) => setRole(event.target.value)}><option value="">All roles</option>{roles.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span className="sr-only">Filter cycle</span><select value={cycle} onChange={(event) => setCycle(event.target.value)}><option value="">All cycles</option>{cycles.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span className="sr-only">Filter checkpoint</span><select value={checkpoint} onChange={(event) => setCheckpoint(event.target.value)}><option value="">All checkpoints</option>{checkpoints.map((value) => <option value={String(value)} key={value}>Checkpoint {value}</option>)}</select></label>
          </div>

          <div className="prediction-table-scroll">
            <table>
              <thead><tr>{TABLE_COLUMNS.map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}</tr></thead>
              <tbody>
                {visibleRows.map((row) => <tr key={row.record_id}>{TABLE_COLUMNS.map((column) => <td key={column}>{pretty(row[column])}</td>)}</tr>)}
              </tbody>
            </table>
            {!visibleRows.length ? <div className="prediction-table-empty">No rows match these filters.</div> : null}
          </div>
          <div className="prediction-table-footer">
            Showing {visibleRows.length} of {filteredRows.length} matching rows · Preview limited to 25 rows
          </div>
        </div>

        <DataReadinessReport readiness={readiness} loading={readinessLoading} />
      </div>
    </section>
  );
}
