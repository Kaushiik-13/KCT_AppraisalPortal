"use client";
import React, { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Layers3,
  TextCursorInput,
  GitBranch,
  Calculator,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Eye,
  PencilRuler,
  FileText,
  Check,
  ChevronRight,
  Settings2,
  FlaskConical,
  X,
  List,
  Hash,
  Calendar,
  ToggleLeft,
  Upload,
} from "lucide-react";
import WorkflowView from "./WorkflowStudio";
import useDraft from "./useDraft";
import ScoringStudio from "./ScoringStudio";

const TYPES = {
  text: "Short text",
  textarea: "Long text",
  number: "Decimal number",
  integer: "Whole number",
  date: "Date",
  datetime: "Date & time",
  email: "Email",
  url: "URL",
  select: "Dropdown",
  multi: "Multiple choice",
  boolean: "Yes / No",
  file: "File upload",
};
const newField = (type = "text", label = "Untitled field") => ({
  id: crypto.randomUUID(),
  label,
  type,
  required: false,
  help: "",
  example: "",
  options: "Option 1\nOption 2",
  accept: ".pdf,.pptx,.xls,.xlsx",
  multiple: false,
});
const typeIcon = (type) =>
  type === "file"
    ? FileText
    : ["number", "integer"].includes(type)
      ? Hash
      : ["date", "datetime"].includes(type)
        ? Calendar
        : ["select", "multi"].includes(type)
          ? List
          : type === "boolean"
            ? ToggleLeft
            : TextCursorInput;
export default function App() {
  const {
    draft: { name, fields, nodes, policy },
    setName,
    setFields,
    setNodes,
    setPolicy,
    save,
    restored,
    blocked,
    retrySave,
    download,
    clearDraft,
  } = useDraft();
  const [navCollapsed, setNavCollapsed] = useState(() => {
    try {
      return localStorage.getItem("afpi.sidebar.collapsed") === "true";
    } catch {
      return false;
    }
  });
  const toggleNav = () =>
    setNavCollapsed((previous) => {
      const next = !previous;
      try {
        localStorage.setItem("afpi.sidebar.collapsed", String(next));
      } catch {}
      return next;
    });
  const [selected, setSelected] = useState(() => fields[0]?.id || null);
  const [tab, setTab] = useState("build");
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [tested, setTested] = useState(false);
  const [notice, setNotice] = useState("");
  const field = fields.find((f) => f.id === selected);
  const update = (patch) => {
    setFields((prev) =>
      prev.map((f) => (f.id === selected ? { ...f, ...patch } : f)),
    );
    setErrors({});
    setTested(false);
  };
  const add = () => {
    const f = newField();
    setFields((prev) => [...prev, f]);
    setSelected(f.id);
    setTested(false);
  };
  const options = (f) => [
    ...new Set(
      f.options
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  ];
  const configErrors = fields.flatMap((f, i) =>
    !f.label.trim()
      ? [`Field ${i + 1} needs a name.`]
      : ["select", "multi"].includes(f.type) && !options(f).length
        ? [`${f.label}: add at least one choice.`]
        : [],
  );
  const move = (index, direction) => {
    setFields((prev) => {
      const next = [...prev];
      [next[index], next[index + direction]] = [
        next[index + direction],
        next[index],
      ];
      return next;
    });
  };
  const setValue = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    setTested(false);
    setErrors({});
  };
  const loadExample = () => {
    if (fields.length) {
      setNotice(
        "The example is available for an empty form. Your current fields have been kept.",
      );
      return;
    }
    const next = [
      newField("file", "Research paper"),
      newField("text", "DOI"),
      newField("url", "Publication URL"),
      newField("text", "Faculty name"),
    ];
    next.forEach((f, i) => (f.required = i === 0 || i === 3));
    setFields(next);
    setSelected(next[0].id);
    setTested(false);
  };
  const test = (event) => {
    event.preventDefault();
    const issues = {};
    for (const f of fields) {
      const v = values[f.id];
      const missing =
        v === undefined || v === "" || (Array.isArray(v) && !v.length);
      if (f.required && missing) issues[f.id] = "This field is required.";
      else if (!missing) {
        if (
          ["number", "integer"].includes(f.type) &&
          (!Number.isFinite(Number(v)) ||
            (f.type === "integer" && !Number.isInteger(Number(v))))
        )
          issues[f.id] =
            f.type === "integer"
              ? "Enter a whole number."
              : "Enter a valid number.";
        if (f.type === "url") {
          try {
            const u = new URL(v);
            if (!["http:", "https:"].includes(u.protocol)) throw Error();
          } catch {
            issues[f.id] = "Enter a complete http or https URL.";
          }
        }
        if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
          issues[f.id] = "Enter a valid email address.";
        if (f.type === "select" && !options(f).includes(v))
          issues[f.id] = "Choose one of the available options.";
        if (f.type === "multi" && v.some((x) => !options(f).includes(x)))
          issues[f.id] = "A selected option was removed. Select again.";
        if (f.type === "file") {
          const allowed = f.accept
            .split(",")
            .map((x) => x.trim().toLowerCase())
            .filter(Boolean);
          if (
            allowed.length &&
            v.some(
              (file) =>
                !allowed.some((a) =>
                  a.startsWith(".")
                    ? file.name.toLowerCase().endsWith(a)
                    : a.endsWith("/*")
                      ? file.type.startsWith(a.slice(0, -1))
                      : file.type === a,
                ),
            )
          )
            issues[f.id] =
              "One or more files do not match the allowed formats.";
        }
      }
    }
    setErrors(issues);
    setTested(true);
  };
  const remove = () => {
    setFields((prev) => prev.filter((f) => f.id !== selected));
    setValues((prev) => {
      const next = { ...prev };
      delete next[selected];
      return next;
    });
    setSelected(fields.find((f) => f.id !== selected)?.id || null);
    setTested(false);
  };
  const duplicate = () => {
    const copy = {
      ...field,
      id: crypto.randomUUID(),
      label: `${field.label} copy`,
    };
    setFields((prev) => [...prev, copy]);
    setSelected(copy.id);
    setTested(false);
  };
  return (
    <div
      className={`shell ${navCollapsed ? "nav-collapsed" : ""} ${tab === "workflow" ? "workflow-shell" : ""}`}
    >
      <aside id="main-navigation" className="sidebar">
        <div className="brand">
          <span>
            <Layers3 size={24} />
          </span>
          AFPI
        </div>
        <div className="sidebar-label">FRAMEWORK STUDIO</div>
        <button
          className={`stage as-button ${["build", "preview"].includes(tab) ? "active" : ""}`}
          onClick={() => setTab("build")}
        >
          <TextCursorInput size={19} />
          <span>
            Inputs<small>Build the submission form</small>
          </span>
          <span className="stage-number">01</span>
        </button>
        <button
          className={`stage as-button ${tab === "policy" ? "active" : "later"}`}
          onClick={() => setTab("policy")}
        >
          <Calculator size={19} />
          <span>
            Scoring policy<small>Define components, rules and points</small>
          </span>
          <span className="stage-number">02</span>
        </button>
        <button
          className={`stage as-button ${tab === "workflow" ? "active" : "later"}`}
          onClick={() => setTab("workflow")}
        >
          <GitBranch size={19} />
          <span>
            Workflow<small>Map evidence to the policy</small>
          </span>
          <span className="stage-number">03</span>
        </button>
      </aside>
      <main>
        <header className="app-header">
          <div>
            <button
              className="nav-toggle"
              aria-label={navCollapsed ? "Show sidebar" : "Hide sidebar"}
              title={navCollapsed ? "Show sidebar" : "Hide sidebar"}
              aria-expanded={!navCollapsed}
              aria-controls="main-navigation"
              onClick={toggleNav}
            >
              {navCollapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )}
            </button>
            <strong>
              {tab === "workflow"
                ? "Workflow"
                : tab === "policy"
                  ? "Scoring policy"
                  : "Inputs"}
            </strong>
            <span className="header-kpi-name">{name || "Untitled KPI"}</span>
          </div>
          <div className="header-draft-actions">
            <span className={`draft save-${save.status}`} role="status">
              {save.status === "saved"
                ? "Saved on this browser"
                : save.status === "error"
                  ? "Could not save"
                  : "Saving..."}
            </span>
            <button className="clear-draft-button" onClick={clearDraft}>
              <Trash2 size={14} />
              Clear saved draft
            </button>
          </div>
        </header>
        <section
          className={
            tab === "workflow" ? "heading workflow-heading" : "heading"
          }
        >
          <div>
            <div className="eyebrow">
              BUILDING BLOCK {tab === "policy" ? "02" : tab === "workflow" ? "03" : "01"}
            </div>
            <h1>
              {tab === "policy"
                ? "Define how achievements earn marks."
                : tab === "workflow"
                  ? "Build and test your verification workflow."
                  : "Every KPI starts with its inputs."}
            </h1>
            <p>
              {tab === "policy"
                ? "Define reusable score components or conditional rules, then save a policy version before mapping the workflow."
                : tab === "workflow"
                  ? "Manually connect evidence extraction and evaluation outputs to your saved scoring policy."
                  : "Define the fields. Choose their types. See the form your faculty will use."}
            </p>
          </div>
          <span className={`draft save-${save.status}`} role="status">
            {save.status === "saved"
              ? "Saved on this browser"
              : save.status === "error"
                ? "Could not save"
                : "Saving..."}
          </span>
        </section>
        {save.status === "error" && (
          <div className="notice save-error" role="alert">
            <span>{save.error}</span>
            <button className="btn" onClick={retrySave}>
              {blocked ? "Save current draft instead" : "Retry save"}
            </button>
            <button className="btn" onClick={download}>
              Download draft
            </button>
          </div>
        )}
        {restored && (
          <div className="draft-restored">
            Draft restored. Your fields, workflow and scoring settings are
            ready. Reattach PDFs and enter test submissions again; test results
            are not saved.
          </div>
        )}
        <div className="toolbar">
          <div className="tabs">
            <button
              className={tab === "build" ? "active" : ""}
              onClick={() => setTab("build")}
            >
              <PencilRuler size={17} />
              Form builder
            </button>
            <button
              className={tab === "preview" ? "active" : ""}
              onClick={() => {
                setTab("preview");
                setTested(false);
              }}
            >
              <Eye size={17} />
              Submission preview
            </button>
            <button
              className={tab === "workflow" ? "active" : ""}
              onClick={() => setTab("workflow")}
            >
              <GitBranch size={17} />
              Workflow nodes
            </button>
          </div>
          <span>
            {fields.length} fields <span className="separator">/</span>{" "}
            {fields.filter((f) => f.required).length} required
          </span>
        </div>
        {notice && (
          <div className="notice" role="status">
            {notice}
            <button aria-label="Dismiss message" onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}
        {tab === "policy" ? (
          <ScoringStudio
            policy={policy}
            onChange={setPolicy}
            fields={fields}
            nodes={nodes}
            setNodes={setNodes}
          />
        ) : tab === "workflow" ? null : tab === "build" ? (
          <div className="builder">
            <section className="field-column">
              <div className="kpi-details">
                <label>
                  KPI name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name your KPI"
                  />
                </label>
                <div className="section-row">
                  <div>
                    <h2>Input fields</h2>
                    <p>Add the information this KPI needs.</p>
                  </div>
                  <button className="btn primary" onClick={add}>
                    <Plus size={16} />
                    Add field
                  </button>
                </div>
              </div>
              {fields.length === 0 ? (
                <div className="empty">
                  <span className="empty-icon">
                    <TextCursorInput size={32} />
                  </span>
                  <h3>Your form starts here.</h3>
                  <p>
                    Add any number of fields, with a name and a data type for
                    each.
                  </p>
                  <button className="btn primary" onClick={add}>
                    <Plus size={16} />
                    Create your first field
                  </button>
                  <button className="text-btn" onClick={loadExample}>
                    Or try publication example inputs <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="field-list">
                  {fields.map((f, i) => {
                    const Icon = typeIcon(f.type);
                    return (
                      <div
                        className={`field-card ${selected === f.id ? "selected" : ""}`}
                        key={f.id}
                      >
                        <button
                          className="field-select"
                          onClick={() => setSelected(f.id)}
                        >
                          <span className="field-index">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="type-icon">
                            <Icon size={19} />
                          </span>
                          <span className="field-name">
                            {f.label || "Unnamed field"}
                            <small>
                              {TYPES[f.type]}
                              {f.required && " · Required"}
                            </small>
                          </span>
                          <ChevronRight size={17} />
                        </button>
                        <div className="reorder">
                          <button
                            aria-label={`Move ${f.label} up`}
                            disabled={i === 0}
                            onClick={() => move(i, -1)}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            aria-label={`Move ${f.label} down`}
                            disabled={i === fields.length - 1}
                            onClick={() => move(i, 1)}
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button className="add-another" onClick={add}>
                    <Plus size={17} />
                    Add another field
                  </button>
                  <div className="field-note">
                    <GitBranch size={17} />
                    <p>
                      Each field keeps a stable identity when renamed or
                      reordered, ready for workflow connections.
                    </p>
                  </div>
                </div>
              )}
            </section>
            <aside className="inspector">
              <div className="inspector-heading">
                <div className="eyebrow">FIELD CONFIGURATION</div>
                <h2>
                  {field
                    ? "Make this field your own"
                    : "Choose a field to begin"}
                  <Settings2 size={18} />
                </h2>
              </div>
              {field ? (
                <div className="inspector-body">
                  <label>
                    Field name
                    <input
                      value={field.label}
                      onChange={(e) => update({ label: e.target.value })}
                      placeholder="e.g. Research paper"
                    />
                  </label>
                  <label>
                    Data type
                    <select
                      value={field.type}
                      onChange={(e) => {
                        update({ type: e.target.value });
                        setValue(field.id, undefined);
                      }}
                    >
                      {Object.entries(TYPES).map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
              <label>
                Field description <span className="optional">Optional</span>
                <textarea
                  rows={3}
                  value={field.help}
                  onChange={(e) => update({ help: e.target.value })}
                  placeholder="Explain what evidence or value the faculty member should provide…"
                />
              </label>
              <label>
                Example value <span className="optional">Optional</span>
                <input
                  value={field.example || ""}
                  onChange={(e) => update({ example: e.target.value })}
                  placeholder="Show a valid example"
                />
              </label>
                  {["select", "multi"].includes(field.type) && (
                    <label>
                      Choices
                      <textarea
                        rows={5}
                        value={field.options}
                        onChange={(e) => update({ options: e.target.value })}
                      />
                      <small>
                        One choice per line. Repeated choices appear only once.
                      </small>
                    </label>
                  )}
                  {field.type === "file" && (
                    <>
                      <label>
                        Allowed file formats
                        <input
                          value={field.accept}
                          onChange={(e) => update({ accept: e.target.value })}
                    placeholder=".pdf, .pptx, .xls, .xlsx"
                        />
                        <small>
                          Comma-separated extensions or MIME types. Leave empty
                          for any file.
                        </small>
                      </label>
                      <label className="check-row">
                        <input
                          type="checkbox"
                          checked={field.multiple}
                          onChange={(e) => {
                            update({ multiple: e.target.checked });
                            setValue(field.id, undefined);
                          }}
                        />
                        Allow multiple files
                      </label>
                    </>
                  )}
                  <label className="required-row">
                    <span>
                      Required field
                      <small>A value must be provided before submission.</small>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={field.required}
                      onChange={(e) => update({ required: e.target.checked })}
                    />
                  </label>
                  <div className="type-tip">
                    {field.type === "boolean"
                      ? "Yes and No are both valid answers. Required means an answer must be selected."
                      : field.type === "file"
                        ? "File selection is local. Connect this field to an extraction node in your workflow."
                        : "Changes appear immediately in the submission preview."}
                  </div>
                  <div className="field-actions">
                    <button className="btn" onClick={duplicate}>
                      <Copy size={15} />
                      Duplicate
                    </button>
                    <button className="btn danger" onClick={remove}>
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="inspector-empty">
                  <Settings2 size={31} />
                  <p>
                    Select a field to set its name, data type and requirements.
                  </p>
                  <span>12 available data types</span>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="preview-page">
            <div className="preview-caption">
              <span>
                <Eye size={18} />
                FACULTY VIEW
              </span>
              <p>This form is generated from your field configuration.</p>
            </div>
            <form className="preview-form" onSubmit={test} noValidate>
              <div className="form-title">
                <span className="type-icon">
                  <FileText size={24} />
                </span>
                <div>
                  <h2>{name || "Untitled KPI"}</h2>
                  <p>Achievement submission</p>
                </div>
              </div>
              {!fields.length ? (
                <div className="preview-empty">
                  <p>No fields yet. Add your first input in the builder.</p>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setTab("build")}
                  >
                    Return to builder
                  </button>
                </div>
              ) : (
                <>
                  {configErrors.length > 0 && (
                    <div className="form-errors">
                      {configErrors.map((x) => (
                        <p key={x}>{x}</p>
                      ))}
                    </div>
                  )}
                  <div className="preview-fields">
                    {fields.map((f) => {
                      const id = `preview-${f.id}`;
                      const v = values[f.id];
                      return (
                        <div
                          className="preview-field"
                          key={`${f.id}-${f.type}-${f.multiple}`}
                        >
                          <label htmlFor={id}>
                            {f.label || "Unnamed field"}
                            {f.required && <em> *</em>}
                          </label>
                  {f.help && <p className="help">{f.help}</p>}
                  {f.example && <p className="help">Example: {f.example}</p>}
                          {f.type === "textarea" ? (
                            <textarea
                              id={id}
                              rows={4}
                              value={v || ""}
                              onChange={(e) => setValue(f.id, e.target.value)}
                            />
                          ) : f.type === "select" || f.type === "boolean" ? (
                            <select
                              id={id}
                              value={v ?? ""}
                              onChange={(e) => setValue(f.id, e.target.value)}
                            >
                              <option value="">Select an answer…</option>
                              {(f.type === "boolean"
                                ? ["Yes", "No"]
                                : options(f)
                              ).map((o) => (
                                <option key={o}>{o}</option>
                              ))}
                            </select>
                          ) : f.type === "multi" ? (
                            <fieldset id={id}>
                              <legend className="sr-only">{f.label}</legend>
                              {options(f).map((o) => (
                                <label className="choice" key={o}>
                                  <input
                                    type="checkbox"
                                    checked={(v || []).includes(o)}
                                    onChange={(e) =>
                                      setValue(
                                        f.id,
                                        e.target.checked
                                          ? [...(v || []), o]
                                          : (v || []).filter((x) => x !== o),
                                      )
                                    }
                                  />
                                  {o}
                                </label>
                              ))}
                            </fieldset>
                          ) : f.type === "file" ? (
                            <div className="file-area">
                              <Upload size={23} />
                              <input
                                id={id}
                                type="file"
                                accept={f.accept}
                                multiple={f.multiple}
                                onChange={(e) =>
                                  setValue(
                                    f.id,
                                    Array.from(e.target.files || []),
                                  )
                                }
                              />
                              <small>
                                Selected files stay in this session. Nothing is
                                uploaded.
                              </small>
                              {v?.length > 0 && (
                                <div className="file-names">
                                  {v.map((x, i) => (
                                    <span key={i}>{x.name}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <input
                              id={id}
                              type={
                                f.type === "integer"
                                  ? "number"
                                  : f.type === "datetime"
                                    ? "datetime-local"
                                    : f.type
                              }
                              step={f.type === "integer" ? "1" : "any"}
                              value={v ?? ""}
                              onChange={(e) => setValue(f.id, e.target.value)}
                            />
                          )}
                          {errors[f.id] && (
                            <p className="error" role="alert">
                              {errors[f.id]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="form-footer">
                    <span>
                      <FlaskConical size={16} />
                      Form validation only
                    </span>
                    <button
                      className="btn primary"
                      disabled={configErrors.length > 0}
                      type="submit"
                    >
                      Test submission <ChevronRight size={16} />
                    </button>
                  </div>
                  {tested && (
                    <div
                      className={`submission-status ${Object.keys(errors).length ? "invalid" : "valid"}`}
                      role="status"
                    >
                      {Object.keys(errors).length ? (
                        `${Object.keys(errors).length} field(s) need attention.`
                      ) : (
                        <>
                          <Check size={19} />
                          Inputs are valid. Open Workflow nodes to run
                          verification and scoring.
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </form>
          </div>
        )}
        <WorkflowView
          policy={policy}
          nodes={nodes}
          setNodes={setNodes}
          fields={fields}
          values={values}
          onValue={setValue}
          onInputs={() => setTab("build")}
          onPolicy={() => setTab("policy")}
          hidden={tab !== "workflow"}
        />
        <footer className="page-footer">
          <span>Framework Studio - executable PoC</span>
          <span>
            Draft autosaves on this browser. Test submissions and PDFs are not
            saved.
          </span>
        </footer>
      </main>
    </div>
  );
}
