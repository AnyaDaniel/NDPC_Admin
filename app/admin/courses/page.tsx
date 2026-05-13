"use client";
import { useMemo, useState } from "react";
import { Plus, RefreshCw, BookOpen, Play, Trash2 } from "lucide-react";
import { adminApi, AdminCourse } from "@/lib/admin-api";
import { useApiResource } from "@/lib/use-api-resource";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { EmptyState } from "@/components/admin/ui/EmptyState";

function difficultyLabel(value?: string | null) { return value ? value.charAt(0).toUpperCase() + value.slice(1) : "-"; }

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, loading, error, reload } = useApiResource(() => adminApi.courses({ pageSize: 100 }), []);
  const courses = data?.courses ?? [];
  const filtered = useMemo(() => courses.filter(c => !search || `${c.title} ${c.category ?? ""}`.toLowerCase().includes(search.toLowerCase())), [courses, search]);

  const createCourse = async () => {
    setSaving(true);
    setActionError(null);
    try {
      await adminApi.createCourse({ title, description, category, difficulty, isPublished: false });
      setShowNew(false); setTitle(""); setDescription(""); setCategory("");
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to create course");
    } finally { setSaving(false); }
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

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5"><div><div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>LEARNING · COURSES</div><h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Courses & Content Management</h1><p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Live backend course CRUD. Module and lesson methods are available in the API layer.</p></div><div className="flex gap-2"><button className="btn" onClick={reload}><RefreshCw size={14} /> Refresh</button><button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={14} /> New course</button></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}><StatCard eyebrow="Total courses" icon={BookOpen} value={courses.length} delta="backend" sparkData={[1,2,3,4,5]} /><StatCard eyebrow="Published" icon={Play} value={courses.filter(c => c.isPublished).length} delta="live" sparkData={[1,2,2,3]} /><StatCard eyebrow="Drafts" icon={BookOpen} value={courses.filter(c => !c.isPublished).length} delta="backend" sparkData={[1,1,2,2]} /></div>
      {actionError && <div className="card" style={{ padding: 14, color: "var(--ndpc-red)", marginBottom: 16 }}>{actionError}</div>}
      <div className="card"><FilterBar search={search} onSearch={setSearch} placeholder="Search courses..." />{loading && <EmptyState icon={RefreshCw} title="Loading courses" />}{error && <EmptyState title="Unable to load courses" description={error} action={<button className="btn" onClick={reload}>Retry</button>} />}{!loading && !error && filtered.length === 0 && <EmptyState title="No courses found" />}{!loading && !error && filtered.length > 0 && <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Course</th><th>Category</th><th>Difficulty</th><th className="num">Modules</th><th className="num">Enrolled</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td><div style={{ fontWeight: 500 }}>{c.title}</div><div className="id-mono">{c.id}</div></td><td>{c.category ?? "-"}</td><td>{difficultyLabel(c.difficulty)}</td><td className="num">{c.modulesCount ?? 0}</td><td className="num">{c.enrolledCount ?? 0}</td><td><StatusBadge value={c.isPublished ? "active" : "draft"} label={c.isPublished ? "published" : "draft"} /></td><td><div className="flex gap-1 justify-end"><button className="btn btn-sm" onClick={() => togglePublish(c)}>{c.isPublished ? "Unpublish" : "Publish"}</button><button className="btn btn-icon btn-ghost btn-sm btn-danger" onClick={() => remove(c)}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table></div>}</div>
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New course" size="lg" footer={<><button className="btn" onClick={() => setShowNew(false)}>Cancel</button><button className="btn btn-primary" disabled={saving || !title.trim()} onClick={createCourse}>{saving ? "Saving..." : "Create course"}</button></>}><div style={{ display: "grid", gap: 14 }}><label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Course title *</span><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></label><label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Description</span><textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></label><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Category</span><input className="input" value={category} onChange={e => setCategory(e.target.value)} /></label><label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Difficulty</span><select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label></div></div></Modal>
    </div>
  );
}
