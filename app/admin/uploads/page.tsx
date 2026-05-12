"use client";
import { useState } from "react";
import { Upload, Plus, Trash2, Eye, RefreshCw, X, Film, FileText, Headphones,
         HelpCircle, Archive, Image as ImageIcon, Check, BookOpen, Play, ChevronDown } from "lucide-react";
import { UPLOADS, COURSES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { StatCard } from "@/components/admin/ui/StatCard";

// ─── Types ────────────────────────────────────────────────────
type UploadCategory = "video" | "pdf" | "audio" | "quiz" | "scorm" | "image" | "misc";

interface QueuedFile {
  id: string;
  name: string;
  size: string;
  category: UploadCategory;
  course: string;
  module: string;
  lessonTitle: string;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
}

// ─── Config ───────────────────────────────────────────────────
const CATEGORIES: { value: UploadCategory; label: string; icon: React.ReactNode; accept: string; hint: string; color: string }[] = [
  { value: "video",  label: "Video",             icon: <Film size={18} />,       accept: ".mp4,.mov,.webm",       hint: "MP4 · MOV · WebM · Max 2 GB", color: "var(--ndpc-blue)" },
  { value: "pdf",    label: "PDF / Document",     icon: <FileText size={18} />,   accept: ".pdf,.doc,.docx,.pptx", hint: "PDF · DOCX · PPTX · Max 100 MB", color: "var(--ndpc-red)" },
  { value: "audio",  label: "Audio",              icon: <Headphones size={18} />, accept: ".mp3,.wav,.m4a,.ogg",   hint: "MP3 · WAV · M4A · Max 500 MB", color: "var(--ndpc-amber)" },
  { value: "quiz",   label: "Quiz / Assessment",  icon: <HelpCircle size={18} />, accept: ".json",                 hint: "NDPC quiz schema JSON", color: "var(--ndpc-green)" },
  { value: "scorm",  label: "SCORM Package",      icon: <Archive size={18} />,    accept: ".zip",                  hint: "SCORM 1.2 or 2004 · .zip", color: "#8b5cf6" },
  { value: "image",  label: "Image / Cover",      icon: <ImageIcon size={18} />,  accept: ".jpg,.jpeg,.png,.webp", hint: "JPG · PNG · WebP · Max 20 MB", color: "#ec4899" },
  { value: "misc",   label: "Supplementary",      icon: <Archive size={18} />,    accept: "*",                     hint: "Any format · Max 200 MB", color: "var(--ink-3)" },
];

const uid = () => Math.random().toString(36).slice(2, 8);

const typeIcon = (t: string) => {
  switch (t) {
    case "video": return <Film size={13} />;
    case "pdf":   return <FileText size={13} />;
    case "audio": return <Headphones size={13} />;
    default:      return <BookOpen size={13} />;
  }
};

const catColor: Record<string, string> = {
  video: "var(--ndpc-blue)", pdf: "var(--ndpc-red)", audio: "var(--ndpc-amber)",
  quiz: "var(--ndpc-green)", scorm: "#8b5cf6", image: "#ec4899", misc: "var(--ink-3)",
};

// ─── Drop zone ────────────────────────────────────────────────
function DropZone({
  cat, onFiles,
}: {
  cat: typeof CATEGORIES[0];
  onFiles: (files: File[]) => void;
}) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <label
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, border: `2px dashed ${dragging ? cat.color : "var(--hairline)"}`,
        borderRadius: 12, padding: "28px 20px", cursor: "pointer", textAlign: "center",
        background: dragging ? `color-mix(in srgb, ${cat.color} 5%, var(--bg-sunk))` : "var(--bg-sunk)",
        transition: "all 0.15s",
      }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input type="file" accept={cat.accept} multiple style={{ display: "none" }} onChange={e => onFiles(Array.from(e.target.files ?? []))} />
      <div style={{ color: cat.color, opacity: 0.8 }}>{cat.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>Drop {cat.label} files here</div>
      <div style={{ fontSize: 11, color: "var(--ink-4)" }}>{cat.hint}</div>
      <div style={{ fontSize: 11.5, color: cat.color, fontWeight: 500, marginTop: 4 }}>or click to browse</div>
    </label>
  );
}

// ─── Upload modal ─────────────────────────────────────────────
function UploadModal({ onClose }: { onClose: () => void }) {
  const [step, setStep]         = useState<"select" | "configure" | "upload">("select");
  const [activeCategory, setActiveCategory] = useState<UploadCategory>("video");
  const [queue, setQueue]       = useState<QueuedFile[]>([]);
  const [selCourse, setSelCourse] = useState("");

  const cat = CATEGORIES.find(c => c.value === activeCategory)!;

  const addFiles = (files: File[]) => {
    const newItems: QueuedFile[] = files.map(f => ({
      id: uid(),
      name: f.name,
      size: f.size > 1e9 ? `${(f.size / 1e9).toFixed(1)} GB`
           : f.size > 1e6 ? `${(f.size / 1e6).toFixed(1)} MB`
           : `${(f.size / 1e3).toFixed(0)} KB`,
      category: activeCategory,
      course: selCourse,
      module: "",
      lessonTitle: f.name.replace(/\.[^.]+$/, ""),
      progress: 0,
      status: "queued",
    }));
    setQueue(q => [...q, ...newItems]);
    setStep("configure");
  };

  const remove = (id: string) => setQueue(q => q.filter(f => f.id !== id));

  const startUpload = () => {
    setStep("upload");
    // Simulate upload progress
    queue.forEach((item, i) => {
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 18 + 5;
        if (prog >= 100) { prog = 100; clearInterval(interval); }
        setQueue(q => q.map(f => f.id === item.id ? { ...f, progress: Math.round(prog), status: prog >= 100 ? "done" : "uploading" } : f));
      }, 200 + i * 80);
    });
  };

  const allDone = queue.every(f => f.status === "done");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,12,30,0.55)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 16,
        boxShadow: "var(--shadow-pop)", width: "min(860px, 95vw)", maxHeight: "92vh",
        display: "flex", flexDirection: "column", animation: "modalIn 0.22s ease",
      }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 600 }}>Upload course files</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-3)" }}>
              {step === "select" ? "Choose file type and drag & drop or browse" : step === "configure" ? "Set metadata for each file" : "Uploading to NDPC CDN…"}
            </p>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0" style={{ padding: "10px 20px", borderBottom: "1px solid var(--hairline)", background: "var(--bg-sunk)" }}>
          {(["select","configure","upload"] as const).map((s, i) => {
            const done = (step === "configure" && i === 0) || (step === "upload" && i < 2) || (allDone && i < 3);
            const active = step === s;
            return (
              <div key={s} className="flex items-center gap-0">
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center",
                    fontSize: 11, fontWeight: 700,
                    background: done ? "var(--ndpc-green)" : active ? "var(--ndpc-blue)" : "var(--bg-elev)",
                    color: done || active ? "white" : "var(--ink-3)",
                    border: active || done ? "none" : "1px solid var(--hairline)",
                  }}>
                    {done ? <Check size={12} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "var(--ink)" : "var(--ink-3)", textTransform: "capitalize" }}>{s}</span>
                </div>
                {i < 2 && <div style={{ width: 32, height: 1, background: "var(--hairline)", margin: "0 8px" }} />}
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", minHeight: 0 }}>

          {/* ── Step 1: Select ── */}
          {step === "select" && (
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", width: "100%", minHeight: 0 }}>
              {/* Category sidebar */}
              <div style={{ borderRight: "1px solid var(--hairline)", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontSize: 10.5, fontFamily: "var(--font-geist-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)", padding: "4px 8px 8px" }}>File type</div>
                {CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => setActiveCategory(c.value)}
                    className="flex items-center gap-2.5"
                    style={{
                      padding: "8px 10px", borderRadius: 7, width: "100%", textAlign: "left",
                      background: activeCategory === c.value ? `color-mix(in srgb, ${c.color} 10%, var(--bg-elev))` : "transparent",
                      color: activeCategory === c.value ? c.color : "var(--ink-2)",
                      fontWeight: activeCategory === c.value ? 600 : 400, fontSize: 13,
                      border: activeCategory === c.value ? `1px solid color-mix(in srgb, ${c.color} 30%, transparent)` : "1px solid transparent",
                    }}>
                    <span style={{ color: c.color, flexShrink: 0 }}>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Drop zone */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Course assignment */}
                <div>
                  <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Assign to course (optional)</label>
                  <select className="field" value={selCourse} onChange={e => setSelCourse(e.target.value)} style={{ maxWidth: 360 }}>
                    <option value="">— Unassigned / upload to library —</option>
                    {COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <DropZone cat={cat} onFiles={addFiles} />
              </div>
            </div>
          )}

          {/* ── Step 2: Configure ── */}
          {step === "configure" && (
            <div style={{ width: "100%", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{queue.length} file{queue.length !== 1 ? "s" : ""} ready to upload</span>
                <button className="btn btn-sm" onClick={() => setStep("select")}><Plus size={12} /> Add more</button>
              </div>

              {queue.map(item => {
                const c = CATEGORIES.find(c => c.value === item.category)!;
                return (
                  <div key={item.id} style={{ border: "1px solid var(--hairline)", borderRadius: 10, padding: "12px 14px" }}>
                    <div className="flex items-start gap-3">
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `color-mix(in srgb, ${c.color} 12%, var(--bg-sunk))`, display: "grid", placeItems: "center", color: c.color, flexShrink: 0 }}>
                        {c.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-geist-mono)" }}>{item.size} · {c.label}</div>
                          </div>
                          <button onClick={() => remove(item.id)} style={{ color: "var(--ink-4)", flexShrink: 0 }}><Trash2 size={13} /></button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                          <div>
                            <label style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 4 }}>Lesson title</label>
                            <input className="field" value={item.lessonTitle} onChange={e => setQueue(q => q.map(f => f.id === item.id ? { ...f, lessonTitle: e.target.value } : f))} style={{ fontSize: 12 }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 4 }}>Course</label>
                            <select className="field" value={item.course} onChange={e => setQueue(q => q.map(f => f.id === item.id ? { ...f, course: e.target.value } : f))} style={{ fontSize: 12 }}>
                              <option value="">Unassigned</option>
                              {COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 4 }}>Module</label>
                            <input className="field" value={item.module} placeholder="e.g. Module 2" onChange={e => setQueue(q => q.map(f => f.id === item.id ? { ...f, module: e.target.value } : f))} style={{ fontSize: 12 }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Step 3: Uploading ── */}
          {step === "upload" && (
            <div style={{ width: "100%", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {allDone ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "32px 0", gap: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "color-mix(in srgb, var(--ndpc-green) 12%, var(--bg-sunk))", display: "grid", placeItems: "center", color: "var(--ndpc-green)" }}>
                    <Check size={24} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>All files uploaded successfully!</div>
                  <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{queue.length} file{queue.length !== 1 ? "s" : ""} added to the content library.</div>
                  <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 8 }}>Done</button>
                </div>
              ) : (
                queue.map(item => {
                  const c = CATEGORIES.find(c => c.value === item.category)!;
                  return (
                    <div key={item.id} style={{ border: "1px solid var(--hairline)", borderRadius: 10, padding: "12px 14px" }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div style={{ width: 32, height: 32, borderRadius: 7, background: `color-mix(in srgb, ${c.color} 12%, var(--bg-sunk))`, display: "grid", placeItems: "center", color: c.color, flexShrink: 0 }}>
                          {item.status === "done" ? <Check size={14} /> : c.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex items-center justify-between">
                            <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                            <span style={{ fontSize: 11.5, fontFamily: "var(--font-geist-mono)", color: item.status === "done" ? "var(--ndpc-green)" : "var(--ink-3)", flexShrink: 0, marginLeft: 8 }}>
                              {item.status === "done" ? "✓ Done" : `${item.progress}%`}
                            </span>
                          </div>
                          <div style={{ marginTop: 6, height: 4, background: "var(--bg-sunk)", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${item.progress}%`, background: item.status === "done" ? "var(--ndpc-green)" : c.color, borderRadius: 999, transition: "width 0.2s ease" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-2" style={{ padding: "12px 20px", borderTop: "1px solid var(--hairline)", background: "var(--bg-sunk)" }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
            {queue.length > 0 ? `${queue.length} file${queue.length !== 1 ? "s" : ""} in queue` : "No files selected"}
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={onClose}>Cancel</button>
            {step === "configure" && queue.length > 0 && (
              <button className="btn btn-primary" onClick={startUpload}><Upload size={14} /> Upload {queue.length} file{queue.length !== 1 ? "s" : ""}</button>
            )}
            {step === "select" && (
              <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}><Upload size={14} /> Select files first</button>
            )}
          </div>
        </div>

        <style>{`@keyframes modalIn { from { transform: translateY(8px) scale(0.98); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function UploadsPage() {
  const [search, setSearch]       = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = UPLOADS.filter(u => {
    if (typeFilter !== "all" && u.type !== typeFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>LEARNING · UPLOADS</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Content Uploads</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Videos, PDFs, audio, quizzes, SCORM packages and supplementary materials.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}><Plus size={14} /> Upload files</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Videos"        icon={Play}     value="412"   delta="+18 this week" deltaDir="up" sparkData={[10,12,14,16,18,20,22]} sparkColor="var(--ndpc-blue)" />
        <StatCard eyebrow="PDFs & docs"   icon={FileText} value="188"   delta="+4 this week"  deltaDir="up" sparkData={[5,6,6,7,7,8,9]} />
        <StatCard eyebrow="Audio files"   icon={Headphones} value="44"  delta="+2 this week"  deltaDir="up" sparkData={[1,2,2,3,3,4,4]} sparkColor="var(--ndpc-amber)" />
        <StatCard eyebrow="Total storage" icon={Upload}   value="184.2" suffix="GB" delta="+2.4 GB this week" deltaDir="up" sparkData={[100,110,120,130,140,160,184]} />
      </div>

      {/* File type quick-filter pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[["all","All files"], ["video","Videos"], ["pdf","PDFs"], ["audio","Audio"], ["quiz","Quizzes"], ["scorm","SCORM"]].map(([v, l]) => (
          <button key={v} onClick={() => setTypeFilter(v)}
            style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: typeFilter === v ? 600 : 400,
              background: typeFilter === v ? "var(--ndpc-blue)" : "var(--bg-sunk)",
              color: typeFilter === v ? "white" : "var(--ink-3)",
              border: typeFilter === v ? "1px solid var(--ndpc-blue)" : "1px solid var(--hairline)",
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <FilterBar search={search} onSearch={setSearch} placeholder="Search by filename, course…">
          <select className="field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="processed">Processed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          <button className="btn btn-sm"><ChevronDown size={13} /> Sort</button>
        </FilterBar>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr><th>File</th><th>Type</th><th>Size</th><th>Course</th><th>Status</th><th>Uploaded</th><th style={{ width: 90 }}></th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: `color-mix(in srgb, ${catColor[u.type] ?? "var(--ink-3)"} 10%, var(--bg-sunk))`, border: "1px solid var(--hairline)", display: "grid", placeItems: "center", color: catColor[u.type] ?? "var(--ink-3)" }}>
                        {typeIcon(u.type)}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-muted" style={{ textTransform: "uppercase", fontSize: 10.5 }}>{u.type}</span></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12, color: "var(--ink-3)" }}>{u.size}</span></td>
                  <td><span className="id-mono">{u.course}</span></td>
                  <td><StatusBadge value={u.status} /></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{u.uploaded}</span></td>
                  <td>
                    <div className="flex gap-1 justify-end">
                      <button className="btn btn-icon btn-ghost btn-sm" title="Preview"><Eye size={13} /></button>
                      {u.status === "failed" && <button className="btn btn-icon btn-ghost btn-sm" title="Retry"><RefreshCw size={13} /></button>}
                      <button className="btn btn-icon btn-ghost btn-sm btn-danger" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--ink-4)", padding: "32px 0", fontSize: 13 }}>No files match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}
