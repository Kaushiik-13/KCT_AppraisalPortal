import React from "react";
const names = {
  scopus: "Scopus",
  wos: "Web of Science",
  sae: "SAE publisher",
  primary: "First author",
  period: "Assessment period",
  duplicate: "Duplicate check",
};
export function FactList({ facts }) {
  return (
    <dl className="fact-list">
      {Object.entries(facts || {}).map(([k, v]) => (
        <React.Fragment key={k}>
          <dt>{names[k] || k}</dt>
          <dd>{String(v)}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
export default function ResultSummary({ kind, result }) {
  if (kind === "use_form_value")
    return (
      <>
        <p>Mapped form value: {String(result ?? "Missing")}</p>
        <p>This step passes the submission value without verifying it.</p>
      </>
    );
  if (kind === "extract_evidence")
    return (
      <>
        <p>
          {result.format?.toUpperCase()} evidence extracted as candidates. Nothing
          in this step is verified.
        </p>
        <p>
          {result.evidence?.length || 0} field finding(s) · {result.warnings?.length || 0} warning(s)
        </p>
        {result.evidence?.map((finding) => (
          <div key={finding.field}>
            <strong>
              {finding.label}: {finding.value ?? "Unknown"}
            </strong>
            {finding.locations?.map((location, index) => (
              <p key={index}>{JSON.stringify(location)}</p>
            ))}
          </div>
        ))}
        <details>
          <summary>Evidence, content and warnings</summary>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </details>
      </>
    );
  if (kind === "compare_evidence")
    return (
      <>
        <p>Overall comparison: {result.status}</p>
        {result.results?.map((finding) => (
          <p key={finding.id}>
            <strong>{finding.name}:</strong> {finding.status} · submitted {String(finding.submitted ?? "missing")} · extracted {String(finding.extracted ?? "missing")}
          </p>
        ))}
        <details>
          <summary>Comparison details</summary>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </details>
      </>
    );
  if (kind === "document_extract")
    return (
      <>
        <p>{result.note}</p>
        <p>
          {result.pageCount} pages · {result.characterCount} characters
        </p>
        <details>
          <summary>Read extracted document text by page</summary>
          {result.pages?.map((p) => (
            <details key={p.page}>
              <summary>Page {p.page}</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {p.text || "No extractable text; manual review or OCR needed."}
              </pre>
            </details>
          ))}
        </details>
        {result.findings?.map((f, i) => (
          <p key={i}>
            {f.name}: {f.value === null ? "Uncertain" : String(f.value)}
          </p>
        ))}
      </>
    );
  if (
    [
      "document_extract",
      "external_lookup",
      "compare_values",
      "date_range",
      "find_duplicates",
      "apply_policy",
    ].includes(kind)
  )
    return (
      <>
        <p>
          {result.note ||
            result.reason ||
            result.scope ||
            `Status: ${result.status}`}
        </p>
        {result.findings?.map((f, i) => (
          <div key={i}>
            <strong>
              {f.name}: {f.value === null ? "Uncertain" : String(f.value)}
            </strong>
            {f.evidence?.map((e, j) => (
              <p key={j}>
                Page {e.page}: {e.excerpt}
              </p>
            ))}
          </div>
        ))}
        <details>
          <summary>Details and evidence</summary>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </details>
      </>
    );
  if (kind === "lookup")
    return (
      <>
        <p>{result.status === "found" ? result.title : result.reason}</p>
        {result.status === "found" && (
          <FactList
            facts={{
              DOI: result.doi,
              Journal: result.journal || "Missing",
              "First author": result.authors?.[0]?.name || "Missing",
              "Published date": result.dates?.published || "Missing",
            }}
          />
        )}
        {result.source && (
          <a href={result.source} target="_blank" rel="noreferrer">
            View Crossref source record
          </a>
        )}
      </>
    );
  if (kind === "author")
    return (
      <>
        <p>{result.reason}</p>
        <FactList
          facts={{
            Faculty: result.faculty,
            "First author": result.primary,
            "Matched position":
              result.matched?.map((m) => m.position).join(", ") || "Unresolved",
          }}
        />
      </>
    );
  if (kind === "period")
    return (
      <>
        <p>
          {result.reason ||
            `Publication date ${result.date} is ${result.status === "eligible" ? "inside" : "outside"} ${result.start} to ${result.end}.`}
        </p>
        {result.dateRule && (
          <p>
            Date rule: {result.dateRule}. Both assessment boundaries are
            included.
          </p>
        )}
      </>
    );
  if (kind === "index")
    return (
      <>
        <p>
          <strong>Simulated paper-level index check.</strong> This does not
          establish real indexing.
        </p>
        <FactList
          facts={{ scopus: result.scopus, wos: result.wos, sae: result.sae }}
        />
        <p>{result.source}</p>
        {result.coverage && (
          <p>
            Mock coverage: {result.coverage.start} to {result.coverage.end}.
          </p>
        )}
      </>
    );
  if (kind === "duplicate")
    return (
      <>
        <p>
          {result.status === "clear"
            ? "No matching prior submission by this faculty member in the test records."
            : result.status === "candidate"
              ? `${result.records.length} matching prior submission(s). Review before awarding marks.`
              : result.reason}
        </p>
        <p>{result.scope}</p>
        {result.records?.map((r, i) => (
          <p key={i}>
            {r.faculty} · {r.doi}
          </p>
        ))}
      </>
    );
  if (kind === "ai")
    return (
      <>
        {result.instructions && (
          <details>
            <summary>Instructions used</summary>
            <p>{result.instructions}</p>
          </details>
        )}
      {result.inputTruncated && (
        <p>
          The input exceeded the supported context limit. No model evaluation
          was performed.
        </p>
      )}
      {result.structured && (
        <details open>
          <summary>Validated structured evaluation</summary>
          <pre>{JSON.stringify(result.structured, null, 2)}</pre>
        </details>
      )}
      <p className="ai-advice">{result.summary}</p>
        {result.model && <p>Model used: {result.model} · Advisory only</p>}
        {result.questions?.map((q, i) => (
          <p key={i}>
            <strong>{q.finding}</strong>
            <br />
            {q.action}
          </p>
        ))}
      </>
    );
  if (kind === "review")
    return (
      <p>
        The run paused here for an appraiser. The decision form and recorded
        decision appear below.
      </p>
    );
  if (kind === "human_review")
    return (
      <p>
        The automated workflow ended and sent its complete package to the
        separate Human Review module.
      </p>
    );
  return <p>Step completed. Evidence is available in the execution trace.</p>;
}
