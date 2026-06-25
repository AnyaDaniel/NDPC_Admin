"use client";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BookOpen, FileText, Layers, Link as LinkIcon, Pencil, Play, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { adminApi, AdminCourse, AdminLesson, AdminModule } from "@/lib/admin-api";
import { useApiResource } from "@/lib/use-api-resource";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { EmptyState } from "@/components/admin/ui/EmptyState";

function difficultyLabel(value?: string | null) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";
}

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [managing, setManaging] = useState<AdminCourse | null>(null);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [editingModuleId, setEditingModuleId] = useState("");
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [editModuleDescription, setEditModuleDescription] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContentType, setLessonContentType] = useState<"video" | "pdf" | "text" | "interactive">("video");
  const [lessonContentUrl, setLessonContentUrl] = useState("");
  const [lessonStorageKey, setLessonStorageKey] = useState("");
  const [lessonMimeType, setLessonMimeType] = useState("video/mp4");
  const [lessonDuration, setLessonDuration] = useState("0");
  const [editingLessonId, setEditingLessonId] = useState("");
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonContentType, setEditLessonContentType] = useState<"video" | "pdf" | "text" | "interactive">("video");
  const [editLessonDuration, setEditLessonDuration] = useState("0");
  const [contentBusy, setContentBusy] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const { data, loading, error, reload } = useApiResource(() => adminApi.courses({ pageSize: 100 }), []);
  const courses = data?.courses ?? [];
  const filtered = useMemo(
    () => courses.filter(c => !search || `${c.title} ${c.category ?? ""}`.toLowerCase().includes(search.toLowerCase())),
    [courses, search]
  );
  const selectedModule = useMemo(() => modules.find(m => m.id === selectedModuleId), [modules, selectedModuleId]);

  const createCourse = async () => {
    setSaving(true);
    setActionError(null);
    try {
      await adminApi.createCourse({ title, description, category, difficulty, isPublished: false });
      setShowNew(false);
      setTitle("");
      setDescription("");
      setCategory("");
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to create course");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (course: AdminCourse) => {
    await adminApi.updateCourse(course.id, { isPublished: !course.isPublished });
    await reload();
  };

  const remove = async (course: AdminCourse) => {
    if (!confirm(`Delete ${course.title}?`)) return;
    await adminApi.deleteCourse(course.id);
    await reload();
  };

  const loadModules = async (course: AdminCourse) => {
    setManaging(course);
    setContentError(null);
    setContentBusy(true);
    setModules([]);
    setLessons([]);
    setSelectedModuleId("");
    try {
      const data = await adminApi.modules(course.id);
      const list = data.modules ?? [];
      setModules(list);
      const firstId = list[0]?.id ?? "";
      setSelectedModuleId(firstId);
      if (firstId) {
        const lessonData = await adminApi.lessons(firstId);
        setLessons(lessonData.lessons ?? []);
      }
    } catch (err) {
      setContentError(err instanceof Error ? err.message : "Unable to load course content.");
    } finally {
      setContentBusy(false);
    }
  };

  const changeModule = async (id: string) => {
    setSelectedModuleId(id);
    setLessons([]);
    if (!id) return;
    setContentBusy(true);
    setContentError(null);
    try {
      const data = await adminApi.lessons(id);
      setLessons(data.lessons ?? []);
    } catch (err) {
      setContentError(err instanceof Error ? err.message : "Unable to load lessons.");
    } finally {
      setContentBusy(false);
    }
  };

  const createModule = async () => {
    if (!managing || !moduleTitle.trim()) return;
    setContentBusy(true);
    setContentError(null);
    try {
      const created = await adminApi.createModule({
        courseId: managing.id,
        title: moduleTitle.trim(),
        description: moduleDescription.trim() || undefined,
        orderIndex: modules.reduce((max, module) => Math.max(max, module.orderIndex), -1) + 1,
        hasAITester: false,
      });
      setModules(current => [...current, created.module]);
      setSelectedModuleId(created.module.id);
      setLessons([]);
      setModuleTitle("");
      setModuleDescription("");
      await reload();
    } catch (err) {
      setContentError(err instanceof Error ? err.message : "Unable to create module.");
    } finally {
      setContentBusy(false);
    }
  };

  const beginEditModule = (module: AdminModule) => {
    setEditingModuleId(module.id);
    setEditModuleTitle(module.title);
    setEditModuleDescription(module.description ?? "");
  };

  const cancelEditModule = () => {
    setEditingModuleId("");
    setEditModuleTitle("");
    setEditModuleDescription("");
  };

  const saveModule = async (module: AdminModule) => {
    if (!editModuleTitle.trim()) return;
    setContentBusy(true);
    setContentError(null);
    try {
      const updated = await adminApi.updateModule(module.id, {
        title: editModuleTitle.trim(),
        description: editModuleDescription.trim(),
      });
      setModules(current => current.map(item => item.id === module.id ? { ...item, ...updated.module } : item));
      cancelEditModule();
    } catch (err) {
      setContentError(err instanceof Error ? err.message : "Unable to update module.");
    } finally {
      setContentBusy(false);
    }
  };

  const moveModule = async (module: AdminModule, direction: -1 | 1) => {
    const sorted = [...modules].sort((a, b) => a.orderIndex - b.orderIndex);
    const index = sorted.findIndex(item => item.id === module.id);
    const other = sorted[index + direction];
    if (!other) return;
    setContentBusy(true);
    setContentError(null);
    try {
      const temporaryIndex = sorted.reduce((max, item) => Math.max(max, item.orderIndex), -1) + 1;
      await adminApi.updateModule(module.id, { orderIndex: temporaryIndex });
      await adminApi.updateModule(other.id, { orderIndex: module.orderIndex });
      await adminApi.updateModule(module.id, { orderIndex: other.orderIndex });
      const data = await adminApi.modules(module.courseId);
      setModules(data.modules ?? []);
    } catch (err) {
      setContentError(err instanceof Error ? err.message : "Unable to move module.");
      if (managing) {
        const data = await adminApi.modules(managing.id);
        setModules(data.modules ?? []);
      }
    } finally {
      setContentBusy(false);
    }
  };

  const createLesson = async () => {
    if (!selectedModuleId || !lessonTitle.trim()) {
      setContentError("Select or create a class/module and enter a lesson title.");
      return;
    }
    setContentBusy(true);
    setContentError(null);
    try {
      const created = await adminApi.createLesson({
        moduleId: selectedModuleId,
        title: lessonTitle.trim(),
        contentType: lessonContentType,
        contentUrl: lessonContentUrl.trim() || undefined,
        storageProvider: lessonContentUrl.trim() ? "s3" : undefined,
        storageKey: lessonStorageKey.trim() || undefined,
        mimeType: lessonMimeType.trim() || undefined,
        allowOffline: false,
        isEncryptedAsset: false,
        durationMinutes: Number(lessonDuration) || 0,
        orderIndex: lessons.length,
      });
      setLessons(current => [...current, created.lesson]);
      setLessonTitle("");
      setLessonContentUrl("");
      setLessonStorageKey("");
    } catch (err) {
      setContentError(err instanceof Error ? err.message : "Unable to create lesson.");
    } finally {
      setContentBusy(false);
    }
  };

  const removeModule = async (module: AdminModule) => {
    if (!confirm(`Delete ${module.title}? Lessons inside this module will also be removed.`)) return;
    setContentBusy(true);
    setContentError(null);
    try {
      await adminApi.deleteModule(module.id);
      const next = modules.filter(item => item.id !== module.id);
      setModules(next);
      const nextSelected = next[0]?.id ?? "";
      setSelectedModuleId(nextSelected);
      setLessons([]);
      if (nextSelected) await changeModule(nextSelected);
      await reload();
    } catch (err) {
      setContentError(err instanceof Error ? err.message : "Unable to delete module.");
    } finally {
      setContentBusy(false);
    }
  };

  const removeLesson = async (lesson: AdminLesson) => {
    if (!confirm(`Delete ${lesson.title}?`)) return;
    setContentBusy(true);
    setContentError(null);
    try {
      await adminApi.deleteLesson(lesson.id);
      setLessons(current => current.filter(item => item.id !== lesson.id));
    } catch (err) {
      setContentError(err instanceof Error ? err.message : "Unable to delete lesson.");
    } finally {
      setContentBusy(false);
    }
  };

  const beginEditLesson = (lesson: AdminLesson) => {
    setEditingLessonId(lesson.id);
    setEditLessonTitle(lesson.title);
    setEditLessonContentType((lesson.contentType === "video" || lesson.contentType === "pdf" || lesson.contentType === "text" || lesson.contentType === "interactive") ? lesson.contentType : "pdf");
    setEditLessonDuration(String(lesson.durationMinutes ?? 0));
  };

  const cancelEditLesson = () => {
    setEditingLessonId("");
    setEditLessonTitle("");
    setEditLessonContentType("video");
    setEditLessonDuration("0");
  };

  const saveLesson = async (lesson: AdminLesson) => {
    if (!editLessonTitle.trim()) return;
    setContentBusy(true);
    setContentError(null);
    try {
      const updated = await adminApi.updateLesson(lesson.id, {
        title: editLessonTitle.trim(),
        contentType: editLessonContentType,
        durationMinutes: Math.max(0, Number(editLessonDuration) || 0),
      });
      setLessons(current => current.map(item => item.id === lesson.id ? { ...item, ...updated.lesson } : item));
      cancelEditLesson();
    } catch (err) {
      setContentError(err instanceof Error ? err.message : "Unable to update lesson.");
    } finally {
      setContentBusy(false);
    }
  };

  const setContentType = (value: typeof lessonContentType) => {
    setLessonContentType(value);
    setLessonMimeType(value === "pdf" ? "application/pdf" : value === "video" ? "video/mp4" : "text/plain");
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>LEARNING · COURSES</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Courses & Content Management</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Create courses, classes/modules, and lessons from uploaded materials.</p>
        </div>
        <div className="flex gap-2"><button className="btn" onClick={reload}><RefreshCw size={14} /> Refresh</button><button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={14} /> New course</button></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Total courses" icon={BookOpen} value={courses.length} delta="backend" sparkData={[1,2,3,4,5]} />
        <StatCard eyebrow="Published" icon={Play} value={courses.filter(c => c.isPublished).length} delta="live" sparkData={[1,2,2,3]} />
        <StatCard eyebrow="Drafts" icon={BookOpen} value={courses.filter(c => !c.isPublished).length} delta="backend" sparkData={[1,1,2,2]} />
      </div>

      {actionError && <div className="card" style={{ padding: 14, color: "var(--ndpc-red)", marginBottom: 16 }}>{actionError}</div>}

      <div className="card">
        <FilterBar search={search} onSearch={setSearch} placeholder="Search courses..." />
        {loading && <EmptyState icon={RefreshCw} title="Loading courses" />}
        {error && <EmptyState title="Unable to load courses" description={error} action={<button className="btn" onClick={reload}>Retry</button>} />}
        {!loading && !error && filtered.length === 0 && <EmptyState title="No courses found" />}
        {!loading && !error && filtered.length > 0 && <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Course</th><th>Category</th><th>Difficulty</th><th className="num">Modules</th><th className="num">Enrolled</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td><div style={{ fontWeight: 500 }}>{c.title}</div><div className="id-mono">{c.id}</div></td><td>{c.category ?? "-"}</td><td>{difficultyLabel(c.difficulty)}</td><td className="num">{c.modulesCount ?? 0}</td><td className="num">{c.enrolledCount ?? 0}</td><td><StatusBadge value={c.isPublished ? "active" : "draft"} label={c.isPublished ? "published" : "draft"} /></td><td><div className="flex gap-1 justify-end"><button className="btn btn-sm" onClick={() => loadModules(c)}><Layers size={13} /> Content</button><button className="btn btn-sm" onClick={() => togglePublish(c)}>{c.isPublished ? "Unpublish" : "Publish"}</button><button className="btn btn-icon btn-ghost btn-sm btn-danger" onClick={() => remove(c)}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table></div>}
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New course" size="lg" footer={<><button className="btn" onClick={() => setShowNew(false)}>Cancel</button><button className="btn btn-primary" disabled={saving || !title.trim()} onClick={createCourse}>{saving ? "Saving..." : "Create course"}</button></>}>
        <div style={{ display: "grid", gap: 14 }}>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Course title *</span><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Description</span><textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Category</span><input className="input" value={category} onChange={e => setCategory(e.target.value)} /></label>
            <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Difficulty</span><select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(managing)} onClose={() => setManaging(null)} title={managing ? `Content: ${managing.title}` : "Course content"} size="lg" footer={<><button className="btn" onClick={() => setManaging(null)}>Close</button><button className="btn btn-primary" disabled={contentBusy || !lessonTitle.trim() || !selectedModuleId} onClick={createLesson}><Plus size={14} /> Create lesson</button></>}>
        <div style={{ display: "grid", gap: 16 }}>
          {contentError && <div style={{ color: "var(--ndpc-red)", fontSize: 13 }}>{contentError}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>New class/module title</span><input className="input" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} placeholder="Module 1" /></label>
            <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Description</span><input className="input" value={moduleDescription} onChange={e => setModuleDescription(e.target.value)} placeholder="Optional" /></label>
            <button className="btn" disabled={contentBusy || !moduleTitle.trim()} onClick={createModule}><Plus size={13} /> Add module</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Class/module</div>
              <select className="input" value={selectedModuleId} onChange={e => changeModule(e.target.value)}><option value="">Select module</option>{modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>{modules.length === 0 ? <EmptyState icon={Layers} title="No modules yet" description="Create a class/module before adding lessons." /> : modules.map((m, index) => <div key={m.id} style={{ display: "grid", gap: 6 }}>
                <div className="flex gap-1">
                  <button className={`btn ${m.id === selectedModuleId ? "btn-primary" : ""}`} onClick={() => changeModule(m.id)} style={{ justifyContent: "flex-start", flex: 1, minWidth: 0 }}><Layers size={13} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</span></button>
                  <button className="btn btn-icon btn-ghost btn-sm" title="Move module up" disabled={contentBusy || index === 0} onClick={() => moveModule(m, -1)}><ArrowUp size={13} /></button>
                  <button className="btn btn-icon btn-ghost btn-sm" title="Move module down" disabled={contentBusy || index === modules.length - 1} onClick={() => moveModule(m, 1)}><ArrowDown size={13} /></button>
                  <button className="btn btn-icon btn-ghost btn-sm" title="Edit module" disabled={contentBusy} onClick={() => beginEditModule(m)}><Pencil size={13} /></button>
                  <button className="btn btn-icon btn-ghost btn-sm btn-danger" title="Delete module" disabled={contentBusy} onClick={() => removeModule(m)}><Trash2 size={13} /></button>
                </div>
                {editingModuleId === m.id && <div style={{ display: "grid", gap: 6, padding: 8, border: "1px solid var(--hairline)", borderRadius: 8 }}>
                  <input className="input" value={editModuleTitle} onChange={e => setEditModuleTitle(e.target.value)} placeholder="Module title" />
                  <textarea className="input" rows={2} value={editModuleDescription} onChange={e => setEditModuleDescription(e.target.value)} placeholder="Module description" />
                  <div className="flex gap-1 justify-end">
                    <button className="btn btn-sm" disabled={contentBusy} onClick={cancelEditModule}><X size={13} /> Cancel</button>
                    <button className="btn btn-sm btn-primary" disabled={contentBusy || !editModuleTitle.trim()} onClick={() => saveModule(m)}><Save size={13} /> Save</button>
                  </div>
                </div>}
              </div>)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Lessons in {selectedModule?.title ?? "module"}</div>
              <div style={{ border: "1px solid var(--hairline)", borderRadius: 8, minHeight: 134, overflow: "hidden" }}>{lessons.length === 0 ? <EmptyState icon={FileText} title="No lessons yet" description="Add a video, PDF, text, or interactive lesson." /> : <div style={{ display: "grid" }}>{lessons.map((l, index) => {
                const editing = editingLessonId === l.id;
                const type = String(l.contentType ?? "").toLowerCase();
                const minutesLabel = type === "video" ? "Video time / duration (mins)" : type === "pdf" ? "Study time / reading time (mins)" : "Minutes";
                return <div key={l.id} style={{ display: "grid", gap: 8, padding: 10, borderBottom: index === lessons.length - 1 ? "none" : "1px solid var(--hairline)" }}>
                  {editing ? <>
                    <label><span style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 5 }}>Display title</span><input className="input" value={editLessonTitle} onChange={e => setEditLessonTitle(e.target.value)} /></label>
                    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 8 }}>
                      <label><span style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 5 }}>Type</span><select className="input" value={editLessonContentType} onChange={e => setEditLessonContentType(e.target.value as typeof editLessonContentType)}><option value="video">Video</option><option value="pdf">PDF/material</option><option value="text">Text</option><option value="interactive">Interactive</option></select></label>
                      <label><span style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 5 }}>{minutesLabel}</span><input className="input" type="number" min={0} value={editLessonDuration} onChange={e => setEditLessonDuration(e.target.value)} /></label>
                    </div>
                    <div className="flex gap-1 justify-between">
                      <span className="id-mono" style={{ color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>URL/storage unchanged · {l.storageKey || (l.contentUrl ? "url present" : "no url")}</span>
                      <span className="flex gap-1">
                        <button className="btn btn-sm" disabled={contentBusy} onClick={cancelEditLesson}><X size={13} /> Cancel</button>
                        <button className="btn btn-sm btn-primary" disabled={contentBusy || !editLessonTitle.trim()} onClick={() => saveLesson(l)}><Save size={13} /> Save</button>
                      </span>
                    </div>
                  </> : <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
                      <div className="flex gap-2" style={{ marginTop: 4, flexWrap: "wrap" }}>
                        <StatusBadge value={type === "video" ? "active" : "draft"} label={type || "content"} />
                        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{type === "video" ? "Video time" : type === "pdf" ? "Study time" : "Minutes"}: {l.durationMinutes ?? 0} min</span>
                        <span className="id-mono" style={{ color: "var(--ink-3)" }}>{l.contentUrl ? "url" : "-"}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 justify-end">
                      <button className="btn btn-icon btn-ghost btn-sm" title="Edit content metadata" disabled={contentBusy} onClick={() => beginEditLesson(l)}><Pencil size={13} /></button>
                      <button className="btn btn-icon btn-ghost btn-sm btn-danger" title="Delete lesson" disabled={contentBusy} onClick={() => removeLesson(l)}><Trash2 size={13} /></button>
                    </div>
                  </div>}
                </div>;
              })}</div>}</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12, borderTop: "1px solid var(--hairline)", paddingTop: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Add lesson/material</div>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 160px 100px", gap: 12 }}>
              <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Lesson title</span><input className="input" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} /></label>
              <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Type</span><select className="input" value={lessonContentType} onChange={e => setContentType(e.target.value as typeof lessonContentType)}><option value="video">Video</option><option value="pdf">PDF/material</option><option value="text">Text</option><option value="interactive">Interactive</option></select></label>
              <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Minutes</span><input className="input" type="number" min={0} value={lessonDuration} onChange={e => setLessonDuration(e.target.value)} /></label>
            </div>
            <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Uploaded file URL</span><div style={{ position: "relative" }}><LinkIcon size={14} style={{ position: "absolute", left: 12, top: 13, color: "var(--ink-3)" }} /><input className="input" style={{ paddingLeft: 34 }} value={lessonContentUrl} onChange={e => setLessonContentUrl(e.target.value)} placeholder="https://ndpc-bucket.s3..." /></div></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
              <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Storage key</span><input className="input" value={lessonStorageKey} onChange={e => setLessonStorageKey(e.target.value)} placeholder="uploads/video/file.mp4" /></label>
              <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>MIME type</span><input className="input" value={lessonMimeType} onChange={e => setLessonMimeType(e.target.value)} /></label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
