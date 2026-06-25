"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, Edit3, FileText, Film, Link as LinkIcon, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { adminApi, AdminCourse, AdminModule, UploadedContentAsset } from "@/lib/admin-api";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { StatCard } from "@/components/admin/ui/StatCard";

function formatBytes(value?: number | null) {
  const bytes = value ?? 0;
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return bytes ? `${bytes} B` : "-";
}

function assetType(asset: UploadedContentAsset): "video" | "pdf" {
  return asset.kind === "video" || asset.contentType === "video" ? "video" : "pdf";
}

export default function UploadedContentPage() {
  const [assets, setAssets] = useState<UploadedContentAsset[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [kind, setKind] = useState("all");
  const [assigned, setAssigned] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editMinutes, setEditMinutes] = useState("0");
  const [assignTitles, setAssignTitles] = useState<Record<string, string>>({});
  const [assignMinutes, setAssignMinutes] = useState<Record<string, string>>({});

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.uploadedContent({
        kind: kind === "all" ? undefined : kind,
        assigned,
        search,
      });
      setAssets(data.assets ?? []);
      if (data.s3ListError) setMessage(`S3 listing warning: ${data.s3ListError}. Showing audit/lesson records that are available.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load uploaded content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminApi.courses({ pageSize: 100 })
      .then(data => {
        const list = data.courses ?? [];
        setCourses(list);
        setCourseId(list[0]?.id ?? "");
      })
      .catch(() => setError("Unable to load courses."));
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
        setError("Unable to load modules for selected course.");
      });
  }, [courseId]);

  useEffect(() => {
    void loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, assigned]);

  const stats = useMemo(() => ({
    total: assets.length,
    assigned: assets.filter(item => item.isAssigned).length,
    missing: assets.filter(item => !item.isAssigned).length,
  }), [assets]);

  const assignAsset = async (asset: UploadedContentAsset) => {
    if (!moduleId) {
      setError("Select the target course and module before assigning content.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const type = assetType(asset);
      const title = (assignTitles[asset.id] || asset.title || asset.fileName).trim();
      const minutes = Math.max(0, Number(assignMinutes[asset.id] ?? 0) || 0);
      const created = await adminApi.assignUploadedContent({
        moduleId,
        title,
        contentType: type,
        contentUrl: asset.contentUrl,
        storageProvider: asset.storageProvider,
        storageKey: asset.storageKey,
        mimeType: asset.mimeType,
        durationMinutes: type === "video" ? minutes : undefined,
        estimatedMinutes: type === "pdf" ? minutes : undefined,
      });
      setMessage(`Assigned "${created.lesson.title}" to the selected module.`);
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to assign content.");
    } finally {
      setBusy(false);
    }
  };

  const beginEdit = (lesson: UploadedContentAsset["assignedLessons"][number]) => {
    setEditingLessonId(lesson.id);
    setEditTitle(lesson.title);
    setEditMinutes(String(lesson.durationMinutes ?? 0));
  };

  const saveAssignment = async (lesson: UploadedContentAsset["assignedLessons"][number]) => {
    if (!editTitle.trim()) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await adminApi.updateLesson(lesson.id, {
        title: editTitle.trim(),
        contentType: lesson.contentType,
        durationMinutes: Math.max(0, Number(editMinutes) || 0),
      });
      setEditingLessonId("");
      setMessage("Assignment metadata updated.");
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update assignment.");
    } finally {
      setBusy(false);
    }
  };

  const unassign = async (lessonId: string) => {
    if (!confirm("Unassign this content from the module? The uploaded file will remain on the server/S3.")) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await adminApi.unassignUploadedContent(lessonId);
      setMessage("Content unassigned. The uploaded file was not deleted.");
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to unassign content.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>LEARNING · CONTENT LIBRARY</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Uploaded PDF & Video Content</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Find every uploaded video/PDF, assign missing assets to modules, edit lesson titles/minutes, or unassign without deleting the file.</p>
        </div>
        <button className="btn" onClick={loadAssets} disabled={loading || busy}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Server assets" icon={FileText} value={stats.total} sparkData={[1, 2, 3]} />
        <StatCard eyebrow="Assigned" icon={Check} value={stats.assigned} delta="lessons" sparkData={[1, 2]} />
        <StatCard eyebrow="Unassigned" icon={Plus} value={stats.missing} delta="needs module" sparkData={[2, 1]} />
      </div>

      {error && <div className="card" style={{ padding: 14, color: "var(--ndpc-red)", marginBottom: 16 }}>{error}</div>}
      {message && <div className="card" style={{ padding: 14, color: "var(--ndpc-green)", marginBottom: 16 }}>{message}</div>}

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 150px 150px auto", gap: 12, alignItems: "end" }}>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Target course</span><select className="input" value={courseId} onChange={e => setCourseId(e.target.value)}><option value="">Select course</option>{courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Target module</span><select className="input" value={moduleId} onChange={e => setModuleId(e.target.value)}><option value="">Select module</option>{modules.map(module => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Type</span><select className="input" value={kind} onChange={e => setKind(e.target.value)}><option value="all">All</option><option value="video">Video</option><option value="pdf">PDF</option></select></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Status</span><select className="input" value={assigned} onChange={e => setAssigned(e.target.value)}><option value="">All</option><option value="false">Unassigned</option><option value="true">Assigned</option></select></label>
          <button className="btn btn-primary" disabled={loading} onClick={loadAssets}><Search size={14} /> Apply</button>
        </div>
        <div style={{ marginTop: 12, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: 13, color: "var(--ink-3)" }} />
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search file, title, storage key, or module..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void loadAssets(); }} />
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? <EmptyState icon={RefreshCw} title="Loading uploaded content" /> : assets.length === 0 ? <EmptyState icon={FileText} title="No uploaded content found" description="If S3 listing is unavailable, new uploads will still appear from audit logs and assigned lessons." /> : <div style={{ display: "grid" }}>
          {assets.map((asset, index) => {
            const type = assetType(asset);
            const TypeIcon = type === "video" ? Film : FileText;
            return <div key={asset.id} style={{ padding: 14, borderBottom: index === assets.length - 1 ? "none" : "1px solid var(--hairline)", display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="flex gap-2 items-center" style={{ minWidth: 0 }}>
                    <TypeIcon size={16} style={{ color: type === "video" ? "var(--ndpc-blue)" : "var(--ndpc-red)" }} />
                    <div style={{ fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.title || asset.fileName}</div>
                    <StatusBadge value={asset.isAssigned ? "active" : "draft"} label={asset.isAssigned ? `${asset.assignmentCount} assigned` : "unassigned"} />
                  </div>
                  <div className="flex gap-2" style={{ flexWrap: "wrap", marginTop: 6, fontSize: 12, color: "var(--ink-3)" }}>
                    <span>{type.toUpperCase()}</span>
                    <span>{formatBytes(asset.sizeBytes)}</span>
                    <span>{asset.uploadedAt ? new Date(asset.uploadedAt).toLocaleDateString() : "date unknown"}</span>
                    {asset.contentUrl && <a href={asset.contentUrl} target="_blank" rel="noreferrer" className="id-mono"><LinkIcon size={12} /> open</a>}
                  </div>
                  <div className="id-mono" style={{ color: "var(--ink-4)", marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.storageKey || asset.contentUrl || asset.key}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 92px auto", gap: 8, alignItems: "end", minWidth: 420 }}>
                  <label><span style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 5 }}>Assign title</span><input className="input" value={assignTitles[asset.id] ?? asset.title ?? asset.fileName} onChange={e => setAssignTitles(current => ({ ...current, [asset.id]: e.target.value }))} /></label>
                  <label><span style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 5 }}>{type === "video" ? "Mins" : "Read mins"}</span><input className="input" type="number" min={0} value={assignMinutes[asset.id] ?? "0"} onChange={e => setAssignMinutes(current => ({ ...current, [asset.id]: e.target.value }))} /></label>
                  <button className="btn btn-primary btn-sm" disabled={busy || !moduleId || !asset.contentUrl} onClick={() => assignAsset(asset)}><Plus size={13} /> Assign</button>
                </div>
              </div>

              {asset.assignedLessons.length > 0 && <div style={{ display: "grid", gap: 8, padding: 10, borderRadius: 10, background: "var(--bg-sunk)" }}>
                {asset.assignedLessons.map(lesson => <div key={lesson.id} style={{ display: "grid", gap: 8 }}>
                  {editingLessonId === lesson.id ? <div style={{ display: "grid", gridTemplateColumns: "1fr 100px auto", gap: 8, alignItems: "end" }}>
                    <label><span style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 5 }}>Lesson title</span><input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} /></label>
                    <label><span style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 5 }}>Minutes</span><input className="input" type="number" min={0} value={editMinutes} onChange={e => setEditMinutes(e.target.value)} /></label>
                    <span className="flex gap-1"><button className="btn btn-sm" onClick={() => setEditingLessonId("")}><X size={13} /> Cancel</button><button className="btn btn-sm btn-primary" onClick={() => saveAssignment(lesson)} disabled={busy || !editTitle.trim()}><Check size={13} /> Save</button></span>
                  </div> : <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{lesson.title}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{lesson.courseTitle} · {lesson.moduleTitle} · {lesson.durationMinutes ?? 0} min</div>
                    </div>
                    <div className="flex gap-1">
                      <button className="btn btn-icon btn-sm btn-ghost" title="Edit lesson metadata" onClick={() => beginEdit(lesson)}><Edit3 size={13} /></button>
                      <button className="btn btn-icon btn-sm btn-ghost btn-danger" title="Unassign from module" onClick={() => unassign(lesson.id)} disabled={busy}><Trash2 size={13} /></button>
                    </div>
                  </div>}
                </div>)}
              </div>}
            </div>;
          })}
        </div>}
      </div>
    </div>
  );
}
