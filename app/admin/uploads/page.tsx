"use client";
import { useEffect, useMemo, useState } from "react";
import { Archive, Check, FileText, Film, Plus, RefreshCw, Upload } from "lucide-react";
import { adminApi, AdminCourse, AdminModule, UploadResult } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/EmptyState";

type UploadKind = "video" | "pdf" | "material";
type Row = UploadResult & { id: string; uploadedAt: string; lessonId?: string; lessonTitle?: string };

export default function UploadsPage() {
  const [kind, setKind] = useState<UploadKind>("video");
  const [rows, setRows] = useState<Row[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [loading, setLoading] = useState(false);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    adminApi.courses({ pageSize: 100 })
      .then(data => {
        const list = data.courses ?? [];
        setCourses(list);
        setCourseId(current => current || list[0]?.id || "");
      })
      .catch(() => setError("Unable to load courses for lesson creation."));
  }, []);

  useEffect(() => {
    if (!courseId) {
      setModules([]);
      setModuleId("");
      return;
    }
    adminApi.modules(courseId)
      .then(data => {
        const list = data.modules ?? [];
        setModules(list);
        setModuleId(list[0]?.id ?? "");
      })
      .catch(() => {
        setModules([]);
        setModuleId("");
        setError("Unable to load modules for the selected course.");
      });
  }, [courseId]);

  const upload = async (file: File) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await adminApi.upload(kind, file);
      setRows(r => [{ ...result, id: `${Date.now()}`, uploadedAt: new Date().toISOString() }, ...r]);
      if (!lessonTitle.trim()) setLessonTitle(file.name.replace(/\.[^.]+$/, ""));
      setMessage("Upload saved. Select a class/module and create a lesson.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setError("Your admin session expired. Please sign in again.");
      else if (err instanceof ApiError && err.status === 404) setError("Upload endpoint is not available on the live backend yet.");
      else if (err instanceof ApiError && err.code === "INVALID_FILE_TYPE") setError("Unsupported file type for this upload category.");
      else setError("Upload failed. Please check the file and try again.");
    } finally { setLoading(false); }
  };

  const createLesson = async (row: Row) => {
    if (!moduleId) {
      setError("Select a course and class/module before creating the lesson.");
      return;
    }
    const title = lessonTitle.trim() || row.fileName.replace(/\.[^.]+$/, "");
    setCreatingId(row.id);
    setError(null);
    setMessage(null);
    try {
      const { publicUrl: _publicUrl, ...defaults } = row.lessonDefaults;
      const created = await adminApi.createLesson({
        ...defaults,
        moduleId,
        title,
        orderIndex: modules.find(m => m.id === moduleId)?.lessons?.length ?? 0,
        durationMinutes: Number(durationMinutes) || 0,
      });
      setRows(items => items.map(item => item.id === row.id
        ? { ...item, lessonId: created.lesson.id, lessonTitle: created.lesson.title }
        : item));
      setMessage(`Lesson created: ${created.lesson.title}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create lesson from upload.");
    } finally { setCreatingId(null); }
  };

  const accept = kind === "video" ? ".mp4,.mov,.webm" : kind === "pdf" ? ".pdf" : ".pdf,.mp4,.mov,.webm";
  const Icon = kind === "video" ? Film : kind === "pdf" ? FileText : Archive;
  const selectedCourse = useMemo(() => courses.find(c => c.id === courseId), [courses, courseId]);

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5"><div><div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>LEARNING · UPLOADS</div><h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Content Uploads</h1><p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Upload files and create lessons from backend lesson defaults.</p></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}><StatCard eyebrow="Session uploads" icon={Upload} value={rows.length} delta="live upload route" sparkData={[1,2,3,4]} /><StatCard eyebrow="Lessons created" icon={Check} value={rows.filter(r => r.lessonId).length} delta="backend" sparkData={[1,2]} /><StatCard eyebrow="PDF/materials" icon={FileText} value={rows.filter(r => r.kind !== "video").length} sparkData={[1,2]} /></div>
      {error && <div className="card" style={{ padding: 14, color: "var(--ndpc-red)", marginBottom: 16 }}>{error}</div>}
      {message && <div className="card" style={{ padding: 14, color: "var(--ndpc-green)", marginBottom: 16 }}>{message}</div>}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div className="flex items-center gap-2 mb-4">{(["video", "pdf", "material"] as UploadKind[]).map(k => <button key={k} className={`btn ${kind === k ? "btn-primary" : ""}`} onClick={() => setKind(k)}>{k}</button>)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 120px", gap: 12, marginBottom: 14 }}>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Course</span><select className="input" value={courseId} onChange={e => setCourseId(e.target.value)}><option value="">Select course</option>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Class/module</span><select className="input" value={moduleId} onChange={e => setModuleId(e.target.value)}><option value="">Select module</option>{modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Lesson title</span><input className="input" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="Defaults to file name" /></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Minutes</span><input className="input" type="number" min={0} value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} /></label>
        </div>
        {!selectedCourse && <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12 }}>Create or select a course with at least one class/module before creating lessons.</div>}
        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, border: "2px dashed var(--hairline)", borderRadius: 12, padding: "28px 20px", cursor: "pointer", textAlign: "center", background: "var(--bg-sunk)" }}>
          <input type="file" accept={accept} style={{ display: "none" }} onChange={e => { const file = e.target.files?.[0]; if (file) upload(file); e.currentTarget.value = ""; }} />
          <Icon size={22} style={{ color: "var(--ndpc-blue)" }} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>{loading ? "Uploading..." : `Select ${kind} file`}</div>
          <div style={{ fontSize: 11, color: "var(--ink-4)" }}>Backend validates kind, MIME type, and raw file bytes.</div>
        </label>
      </div>
      <div className="card">{rows.length === 0 ? <EmptyState icon={Upload} title="No uploads in this session" description="Uploaded files will appear here with backend URLs and lesson defaults." /> : <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>File</th><th>Kind</th><th>Size</th><th>URL</th><th>Lesson</th><th></th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{r.fileName}</td><td>{r.kind}</td><td>{Math.round(r.sizeBytes / 1024)} KB</td><td><a href={r.contentUrl} target="_blank" rel="noreferrer" className="id-mono">{r.contentUrl}</a></td><td>{r.lessonId ? <><StatusBadge value="active" label="created" /> <span className="id-mono">{r.lessonId}</span></> : <StatusBadge value="draft" label="not attached" />}</td><td><button className="btn btn-sm" disabled={Boolean(r.lessonId) || creatingId === r.id || !moduleId} onClick={() => createLesson(r)}><Plus size={12} /> {creatingId === r.id ? "Creating..." : "Create lesson"}</button></td></tr>)}</tbody></table></div>}</div>
    </div>
  );
}
