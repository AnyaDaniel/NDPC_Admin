"use client";
import { useState } from "react";
import { Plus, MoreHorizontal, Eye, Edit, Check, Pause, Clock, BookOpen, Play,
         ChevronDown, ChevronRight, Trash2, GripVertical, FileText, Film,
         Headphones, Archive, HelpCircle, Image as ImageIcon, Upload, X, Save } from "lucide-react";
import { COURSES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { Tabs } from "@/components/admin/ui/Tabs";
import { Drawer } from "@/components/admin/ui/Drawer";

// ─── Types ────────────────────────────────────────────────────
type LessonType = "video" | "pdf" | "audio" | "quiz" | "scorm" | "file";

interface LessonItem {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  file?: string;
}

interface ModuleItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

// ─── Helpers ──────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);

const LESSON_ICONS: Record<LessonType, React.ReactNode> = {
  video:  <Film size={13} />,
  pdf:    <FileText size={13} />,
  audio:  <Headphones size={13} />,
  quiz:   <HelpCircle size={13} />,
  scorm:  <Archive size={13} />,
  file:   <Archive size={13} />,
};
const LESSON_ACCEPT: Record<LessonType, string> = {
  video:  ".mp4,.mov,.webm",
  pdf:    ".pdf,.doc,.docx",
  audio:  ".mp3,.wav,.m4a",
  quiz:   ".json",
  scorm:  ".zip",
  file:   "*",
};
const LESSON_LABEL: Record<LessonType, string> = {
  video: "Video", pdf: "PDF / Doc", audio: "Audio", quiz: "Quiz JSON", scorm: "SCORM (.zip)", file: "Misc file",
};

const DEFAULT_MODULES: ModuleItem[] = [
  {
    id: uid(), title: "Module 1: Introduction",
    lessons: [
      { id: uid(), title: "Welcome & overview", type: "video",  duration: "" },
      { id: uid(), title: "Course materials",   type: "pdf",    duration: "" },
    ],
  },
];

// ─── File drop zone ───────────────────────────────────────────
function DropZone({ label, accept, icon, hint }: { label: string; accept: string; icon: React.ReactNode; hint?: string }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <label
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, border: `2px dashed ${dragging ? "var(--ndpc-blue)" : "var(--hairline)"}`,
        borderRadius: 10, padding: "20px 16px", cursor: "pointer", textAlign: "center",
        background: dragging ? "color-mix(in srgb, var(--ndpc-blue) 4%, var(--bg-sunk))" : "var(--bg-sunk)",
        transition: "all 0.15s",
      }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name); }}
    >
      <input type="file" accept={accept} style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) setFileName(f.name); }} />
      <div style={{ color: "var(--ndpc-blue)", opacity: 0.8 }}>{icon}</div>
      {fileName ? (
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)" }}>{fileName}</div>
      ) : (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink-2)" }}>{label}</div>
          {hint && <div style={{ fontSize: 11, color: "var(--ink-4)" }}>{hint}</div>}
        </>
      )}
    </label>
  );
}

// ─── Curriculum builder ───────────────────────────────────────
function CurriculumBuilder({ modules, onChange }: { modules: ModuleItem[]; onChange: (m: ModuleItem[]) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [modules[0]?.id]: true });
  const [addingLesson, setAddingLesson] = useState<string | null>(null);

  const toggleMod = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const addModule = () => {
    const m: ModuleItem = { id: uid(), title: `Module ${modules.length + 1}`, lessons: [] };
    onChange([...modules, m]);
    setExpanded(p => ({ ...p, [m.id]: true }));
  };

  const removeModule = (id: string) => onChange(modules.filter(m => m.id !== id));

  const updateModTitle = (id: string, title: string) =>
    onChange(modules.map(m => m.id === id ? { ...m, title } : m));

  const addLesson = (modId: string, type: LessonType) => {
    onChange(modules.map(m => m.id !== modId ? m : {
      ...m,
      lessons: [...m.lessons, { id: uid(), title: `New ${LESSON_LABEL[type]}`, type, duration: "" }],
    }));
    setAddingLesson(null);
  };

  const removeLesson = (modId: string, lesId: string) =>
    onChange(modules.map(m => m.id !== modId ? m : { ...m, lessons: m.lessons.filter(l => l.id !== lesId) }));

  const updateLesson = (modId: string, lesId: string, patch: Partial<LessonItem>) =>
    onChange(modules.map(m => m.id !== modId ? m : {
      ...m, lessons: m.lessons.map(l => l.id === lesId ? { ...l, ...patch } : l),
    }));

  return (
    <div className="flex flex-col gap-3">
      {modules.map((mod, mi) => (
        <div key={mod.id} style={{ border: "1px solid var(--hairline)", borderRadius: 10, overflow: "hidden" }}>
          {/* Module header */}
          <div className="flex items-center gap-2" style={{ padding: "8px 12px", background: "var(--bg-sunk)" }}>
            <GripVertical size={14} style={{ color: "var(--ink-4)", cursor: "grab" }} />
            <button onClick={() => toggleMod(mod.id)} style={{ color: "var(--ink-3)" }}>
              {expanded[mod.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <input
              value={mod.title}
              onChange={e => updateModTitle(mod.id, e.target.value)}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}
            />
            <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, color: "var(--ink-4)" }}>MOD-0{mi + 1} · {mod.lessons.length} lessons</span>
            {modules.length > 1 && (
              <button onClick={() => removeModule(mod.id)} style={{ color: "var(--ink-4)" }}><Trash2 size={13} /></button>
            )}
          </div>

          {/* Lessons */}
          {expanded[mod.id] && (
            <div style={{ padding: "6px 12px 10px" }}>
              {mod.lessons.map(les => (
                <div key={les.id} className="flex items-center gap-2" style={{ padding: "5px 0", borderBottom: "1px solid var(--hairline)" }}>
                  <GripVertical size={12} style={{ color: "var(--ink-4)", cursor: "grab", flexShrink: 0 }} />
                  <span style={{ color: "var(--ink-3)", flexShrink: 0 }}>{LESSON_ICONS[les.type]}</span>
                  <input
                    value={les.title}
                    onChange={e => updateLesson(mod.id, les.id, { title: e.target.value })}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12.5, color: "var(--ink)" }}
                  />
                  <select
                    value={les.type}
                    onChange={e => updateLesson(mod.id, les.id, { type: e.target.value as LessonType })}
                    style={{ fontSize: 11, background: "var(--bg-sunk)", border: "1px solid var(--hairline)", borderRadius: 5, padding: "2px 6px", color: "var(--ink-2)" }}
                  >
                    {(Object.keys(LESSON_LABEL) as LessonType[]).map(t => (
                      <option key={t} value={t}>{LESSON_LABEL[t]}</option>
                    ))}
                  </select>
                  <input
                    value={les.duration}
                    onChange={e => updateLesson(mod.id, les.id, { duration: e.target.value })}
                    placeholder="0:00"
                    style={{ width: 44, fontSize: 11, background: "var(--bg-sunk)", border: "1px solid var(--hairline)", borderRadius: 5, padding: "2px 6px", color: "var(--ink-3)", textAlign: "center", fontFamily: "var(--font-geist-mono)" }}
                  />
                  <label style={{ cursor: "pointer", color: "var(--ndpc-blue)" }} title="Attach file">
                    <input type="file" accept={LESSON_ACCEPT[les.type]} style={{ display: "none" }} onChange={e => updateLesson(mod.id, les.id, { file: e.target.files?.[0]?.name })} />
                    <Upload size={12} />
                  </label>
                  {les.file && <span style={{ fontSize: 10, color: "var(--ndpc-green)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{les.file}</span>}
                  <button onClick={() => removeLesson(mod.id, les.id)} style={{ color: "var(--ink-4)" }}><Trash2 size={12} /></button>
                </div>
              ))}

              {/* Add lesson */}
              {addingLesson === mod.id ? (
                <div className="flex items-center gap-1.5 flex-wrap" style={{ marginTop: 8 }}>
                  {(Object.keys(LESSON_LABEL) as LessonType[]).map(t => (
                    <button key={t} onClick={() => addLesson(mod.id, t)}
                      className="flex items-center gap-1"
                      style={{ padding: "3px 8px", fontSize: 11.5, borderRadius: 6, border: "1px solid var(--ndpc-blue)", color: "var(--ndpc-blue)", background: "color-mix(in srgb, var(--ndpc-blue) 6%, transparent)" }}>
                      {LESSON_ICONS[t]} {LESSON_LABEL[t]}
                    </button>
                  ))}
                  <button onClick={() => setAddingLesson(null)} style={{ padding: "3px 8px", fontSize: 11.5, color: "var(--ink-3)" }}>Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingLesson(mod.id)}
                  className="flex items-center gap-1"
                  style={{ marginTop: 8, fontSize: 12, color: "var(--ndpc-blue)", padding: "3px 0" }}>
                  <Plus size={12} /> Add lesson
                </button>
              )}
            </div>
          )}
        </div>
      ))}
      <button onClick={addModule} className="flex items-center gap-1.5 justify-center"
        style={{ border: "2px dashed var(--hairline)", borderRadius: 10, padding: "10px", fontSize: 13, color: "var(--ink-3)", width: "100%" }}>
        <Plus size={13} /> Add module
      </button>
    </div>
  );
}

// ─── Course form (used by both new + edit) ────────────────────
function CourseForm({
  initial, onSave, onCancel, saveLabel = "Save"
}: {
  initial?: Partial<typeof COURSES[0]>;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const [formTab, setFormTab] = useState("info");
  const [modules, setModules]     = useState<ModuleItem[]>(DEFAULT_MODULES);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline)", flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 600 }}>{initial?.title ? `Edit: ${initial.title}` : "New course"}</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-3)" }}>Fill in all sections before publishing.</p>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onCancel}><X size={16} /></button>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 20px", borderBottom: "1px solid var(--hairline)", flexShrink: 0 }}>
        <Tabs value={formTab} onChange={setFormTab} tabs={[
          { value: "info",       label: "Basic info" },
          { value: "curriculum", label: "Curriculum" },
          { value: "files",      label: "Files & media" },
          { value: "settings",   label: "Settings" },
        ]} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

        {/* ── Info tab ── */}
        {formTab === "info" && (
          <div className="flex flex-col gap-4">
            <div>
              <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Course title *</label>
              <input className="input" defaultValue={initial?.title ?? ""} placeholder="e.g. Advanced Procurement Auditing" style={{ fontSize: 14, fontWeight: 500 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Short description *</label>
              <textarea className="input" rows={3} defaultValue="" placeholder="What learners will achieve in this course…" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Learning objectives</label>
              <textarea className="input" rows={4} placeholder="• Objective 1&#10;• Objective 2&#10;• Objective 3" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Category *</label>
                <select className="input" defaultValue={initial?.cat ?? ""}>
                  <option value="" disabled>Select category</option>
                  <option>Compliance</option><option>Finance</option><option>Technology</option>
                  <option>Soft Skills</option><option>Privacy</option><option>Public Sector</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Difficulty *</label>
                <select className="input" defaultValue={initial?.diff ?? ""}>
                  <option value="" disabled>Select level</option>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Language</label>
                <select className="input">
                  <option>English</option><option>Yoruba</option><option>Igbo</option><option>Hausa</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Duration (total)</label>
                <input className="input" defaultValue={initial?.duration ?? ""} placeholder="e.g. 6h 30m" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Tags (comma separated)</label>
              <input className="input" placeholder="NDPR, Data Protection, Nigeria Law…" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Cover image</label>
              <DropZone label="Drop cover image or click to browse" accept=".jpg,.jpeg,.png,.webp" icon={<ImageIcon size={22} />} hint="Recommended: 1280×720px · JPG or PNG" />
            </div>
          </div>
        )}

        {/* ── Curriculum tab ── */}
        {formTab === "curriculum" && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12.5, color: "var(--ink-3)", margin: 0 }}>
                Build your course structure. Add modules, then add lessons to each module. Each lesson can have one attached file.
              </p>
            </div>
            <CurriculumBuilder modules={modules} onChange={setModules} />
          </div>
        )}

        {/* ── Files tab ── */}
        {formTab === "files" && (
          <div className="flex flex-col gap-5">
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Video lessons</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>Upload MP4, MOV, or WebM. Max 2 GB per file. Videos are transcoded automatically.</div>
              <DropZone label="Drop video files here or browse" accept=".mp4,.mov,.webm" icon={<Film size={22} />} hint="MP4 · MOV · WebM · Max 2 GB per file" />
            </div>
            <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>PDF & documents</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>Reading materials, slide decks, and reference documents.</div>
              <DropZone label="Drop PDFs or documents here" accept=".pdf,.doc,.docx,.pptx" icon={<FileText size={22} />} hint="PDF · DOCX · PPTX · Max 100 MB per file" />
            </div>
            <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Audio narrations</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>Lecture recordings or supplementary audio tracks.</div>
              <DropZone label="Drop audio files here" accept=".mp3,.wav,.m4a,.ogg" icon={<Headphones size={22} />} hint="MP3 · WAV · M4A · Max 500 MB per file" />
            </div>
            <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Quiz / assessments</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>Upload a JSON file following the NDPC quiz schema, or attach a SCORM package.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <DropZone label="Quiz JSON" accept=".json" icon={<HelpCircle size={22} />} hint="NDPC quiz schema v2" />
                <DropZone label="SCORM package" accept=".zip" icon={<Archive size={22} />} hint=".zip · SCORM 1.2 or 2004" />
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Supplementary files</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>Worksheets, templates, case studies, or any other supporting materials.</div>
              <DropZone label="Drop any supporting files" accept="*" icon={<Archive size={22} />} hint="Any format · Max 200 MB per file" />
            </div>
            <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Certificate template</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>Optional custom certificate design for this course (overrides platform default).</div>
              <DropZone label="Drop certificate template" accept=".pdf,.png" icon={<ImageIcon size={22} />} hint="PDF or PNG · A4 landscape" />
            </div>
          </div>
        )}

        {/* ── Settings tab ── */}
        {formTab === "settings" && (
          <div className="flex flex-col gap-5">
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Access & enrolment</div>
              <div className="flex flex-col gap-3">
                {[
                  ["Require active subscription", "Learners must have an active plan to access this course"],
                  ["Allow free preview", "First lesson of each module is viewable without enrolment"],
                  ["Require completion order", "Lessons must be completed in sequence"],
                  ["Enable offline download", "Learners can download for offline viewing on mobile"],
                ].map(([label, hint]) => (
                  <div key={label} className="flex items-start justify-between gap-4" style={{ padding: "10px 0", borderBottom: "1px solid var(--hairline)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{hint}</div>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
                      <input type="checkbox" defaultChecked={label.includes("subscription")} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Certificate & completion</div>
              <div className="flex flex-col gap-3">
                <div>
                  <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Passing score (%)</label>
                  <input className="input" style={{ maxWidth: 120 }} defaultValue="75" type="number" min={0} max={100} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Issue certificate on completion</label>
                  <select className="input" style={{ maxWidth: 260 }}>
                    <option>Yes — use default template</option>
                    <option>Yes — use course template</option>
                    <option>No certificate</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Certificate validity</label>
                  <select className="input" style={{ maxWidth: 260 }}>
                    <option>Lifetime</option>
                    <option>1 year</option>
                    <option>2 years</option>
                    <option>3 years</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Pricing</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Price model</label>
                  <select className="input">
                    <option>Included in subscription</option>
                    <option>One-time purchase</option>
                    <option>Free</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>CPD points awarded</label>
                  <input className="input" type="number" defaultValue="5" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center gap-2" style={{ padding: "12px 20px", borderTop: "1px solid var(--hairline)", background: "var(--bg-sunk)", flexShrink: 0 }}>
        <button className="btn" onClick={onCancel}>Cancel</button>
        <div className="flex gap-2">
          <button className="btn"><Save size={14} /> Save draft</button>
          <button className="btn btn-primary" onClick={onSave}><Check size={14} /> {saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function CoursesPage() {
  const [view, setView]         = useState<"grid" | "list">("grid");
  const [sel, setSel]           = useState<typeof COURSES[0] | null>(null);
  const [showNew, setShowNew]   = useState(false);
  const [editing, setEditing]   = useState<typeof COURSES[0] | null>(null);
  const [search, setSearch]     = useState("");
  const [courseTab, setCourseTab] = useState("curriculum");

  const filtered = COURSES.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>LEARNING · COURSES</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Courses &amp; Content Management</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Build the catalogue: modules, lessons, videos, PDFs — publish in one click.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div style={{ display: "inline-flex", padding: 3, background: "var(--bg-sunk)", border: "1px solid var(--line)", borderRadius: 8, gap: 2 }}>
            {(["grid","list"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "4px 10px", fontSize: 12.5, borderRadius: 5, height: 26, color: view === v ? "var(--ink)" : "var(--ink-3)", background: view === v ? "var(--bg-elev)" : "transparent", boxShadow: view === v ? "var(--shadow-card)" : "none" }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={14} /> New course</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Total courses"    icon={BookOpen} value="42"  delta="+2 this month" deltaDir="up" sparkData={[20,22,25,28,30,35,42]} />
        <StatCard eyebrow="Videos uploaded"  icon={Play}     value="412" delta="+18 this week"  deltaDir="up" sparkData={[10,12,14,16,18,20,22]} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="PDFs & materials" icon={BookOpen} value="188" delta="+4 this week"   deltaDir="up" sparkData={[5,6,6,7,7,8,9]} />
      </div>

      {/* Grid view */}
      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(c => (
            <div key={c.id} className="card" style={{ padding: 0 }}>
              <button style={{ textAlign: "left", cursor: "pointer", display: "block", width: "100%", padding: 0 }} onClick={() => { setSel(c); setCourseTab("curriculum"); }}>
                <div className="ph" style={{ height: 130, borderRadius: "12px 12px 0 0", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {c.cat} · cover
                </div>
                <div style={{ padding: 14 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-muted">{c.cat}</span>
                    <StatusBadge value={c.published ? "active" : "pending"} label={c.published ? "published" : "draft"} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 6, lineHeight: 1.3 }}>{c.title}</div>
                  <div className="flex gap-3 mb-3" style={{ color: "var(--ink-3)", fontSize: 12 }}>
                    <span className="flex items-center gap-1"><Clock size={11} /> {c.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {c.modules}m</span>
                    <span className="flex items-center gap-1"><Play size={11} /> {c.lessons}l</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12, color: "var(--ink-2)" }}>{c.enrolled.toLocaleString()} enrolled</span>
                    <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--ink-3)" }}>{c.diff}</span>
                  </div>
                </div>
              </button>
              {/* Card actions */}
              <div className="flex gap-1 justify-end" style={{ padding: "8px 12px", borderTop: "1px solid var(--hairline)" }}>
                <button className="btn btn-sm btn-ghost" onClick={() => { setEditing(c); }}><Edit size={12} /> Edit</button>
                <button className="btn btn-sm" style={{ color: c.published ? "var(--ndpc-red)" : "var(--ndpc-green)" }}>
                  {c.published ? <><Pause size={12} /> Unpublish</> : <><Check size={12} /> Publish</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="card">
          <FilterBar search={search} onSearch={setSearch} placeholder="Search courses…" />
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Course</th><th>Category</th><th>Difficulty</th><th className="num">Duration</th><th className="num">Lessons</th><th className="num">Enrolled</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => { setSel(c); setCourseTab("curriculum"); }}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: 32, height: 24, borderRadius: 4, background: "var(--bg-sunk)", border: "1px solid var(--hairline)" }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{c.title}</div>
                          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--ink-3)" }}>{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.cat}</td><td>{c.diff}</td>
                    <td className="num">{c.duration}</td><td className="num">{c.lessons}</td><td className="num">{c.enrolled.toLocaleString()}</td>
                    <td><StatusBadge value={c.published ? "active" : "pending"} label={c.published ? "published" : "draft"} /></td>
                    <td>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setEditing(c)} title="Edit"><Edit size={13} /></button>
                        <button className="btn btn-icon btn-ghost btn-sm" title="More"><MoreHorizontal size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course detail modal */}
      <Modal open={!!sel} onClose={() => setSel(null)} size="lg"
        title={sel?.title ?? ""}
        footer={<>
          <button className="btn"><Eye size={14} /> Preview</button>
          <button className="btn" onClick={() => { setEditing(sel); setSel(null); }}><Edit size={14} /> Edit course</button>
          <button className="btn btn-primary" onClick={() => setSel(null)}>
            {sel?.published ? <><Pause size={14} /> Unpublish</> : <><Check size={14} /> Publish</>}
          </button>
        </>}>
        {sel && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="ph" style={{ width: 80, height: 56, flexShrink: 0 }}>{sel.cat}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-muted">{sel.cat}</span>
                  <StatusBadge value={sel.published ? "active" : "pending"} label={sel.published ? "published" : "draft"} />
                </div>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{sel.id} · {sel.duration} · {sel.modules} modules · {sel.lessons} lessons</div>
              </div>
              <div className="flex gap-4 ml-auto">
                {[["Enrolled", sel.enrolled.toLocaleString()], ["Completion", "74%"], ["Avg score", "83"]].map(([l, v]) => (
                  <div key={l} className="text-center">
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <Tabs value={courseTab} onChange={setCourseTab} tabs={[
              { value: "curriculum", label: "Curriculum" },
              { value: "details",    label: "Details" },
              { value: "learners",   label: "Enrolled learners" },
            ]} />
            {courseTab === "curriculum" && (
              <div className="flex flex-col gap-2">
                {["Introduction & Statutory Basis", "Filing & Compliance", "Case Studies"].map((mod, i) => (
                  <div key={i} style={{ border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden" }}>
                    <div className="flex items-center gap-2" style={{ padding: "8px 12px", background: "var(--bg-sunk)", fontWeight: 500, fontSize: 13 }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--ink-3)" }}>MOD-0{i+1}</span>
                      <span>{mod}</span>
                    </div>
                    <div style={{ padding: "6px 12px" }}>
                      {[["Video lesson","video"],["Video lesson","video"],["PDF material","pdf"]].map(([l, t], j) => (
                        <div key={j} className="flex items-center gap-2" style={{ padding: "4px 0", fontSize: 12.5, color: "var(--ink-2)" }}>
                          {t === "video" ? <Play size={11} /> : <FileText size={11} />} {l}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {courseTab === "details" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[["Category", sel.cat], ["Difficulty", sel.diff], ["Duration", sel.duration], ["Modules", sel.modules], ["Lessons", sel.lessons]].map(([l, v]) => (
                  <div key={String(l)}><div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>{l}</div><div>{v}</div></div>
                ))}
              </div>
            )}
            {courseTab === "learners" && (
              <p style={{ color: "var(--ink-3)", fontSize: 13 }}>{sel.enrolled.toLocaleString()} learners enrolled.</p>
            )}
          </div>
        )}
      </Modal>

      {/* ── Edit drawer (full form) ── */}
      <Drawer open={!!editing} onClose={() => setEditing(null)}>
        <CourseForm
          initial={editing ?? undefined}
          onSave={() => setEditing(null)}
          onCancel={() => setEditing(null)}
          saveLabel="Save changes"
        />
      </Drawer>

      {/* ── New course drawer (full form) ── */}
      <Drawer open={showNew} onClose={() => setShowNew(false)}>
        <CourseForm
          onSave={() => setShowNew(false)}
          onCancel={() => setShowNew(false)}
          saveLabel="Create & publish"
        />
      </Drawer>
    </div>
  );
}
