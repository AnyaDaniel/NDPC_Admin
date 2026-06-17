"use client";
import { useState } from "react";
import { Edit3, Plus, RefreshCw, Rocket, Trash2 } from "lucide-react";
import { adminApi, AppUpdateRelease } from "@/lib/admin-api";
import { useApiResource } from "@/lib/use-api-resource";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Modal } from "@/components/admin/ui/Modal";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

const platforms = ["windows", "macos", "android", "ios"] as const;

const emptyForm = {
  platform: "windows",
  version: "",
  minSupportedVersion: "",
  downloadUrl: "",
  releaseNotes: "",
  mandatory: false,
  isPublished: false,
};

export default function AppUpdatesPage() {
  const { data, loading, error, reload } = useApiResource(() => adminApi.appUpdates(), []);
  const releases = data?.releases ?? [];
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AppUpdateRelease | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (release: AppUpdateRelease) => {
    setEditing(release);
    setForm({
      platform: String(release.platform),
      version: release.version,
      minSupportedVersion: release.minSupportedVersion ?? "",
      downloadUrl: release.downloadUrl ?? "",
      releaseNotes: Array.isArray(release.releaseNotes) ? release.releaseNotes.join("\n") : String(release.releaseNotes ?? ""),
      mandatory: Boolean(release.mandatory),
      isPublished: Boolean(release.isPublished),
    });
    setShowForm(true);
  };

  const payload = () => ({
    platform: form.platform,
    version: form.version.trim(),
    minSupportedVersion: form.minSupportedVersion.trim() || undefined,
    downloadUrl: form.downloadUrl.trim() || undefined,
    releaseNotes: form.releaseNotes.split("\n").map(line => line.trim()).filter(Boolean),
    mandatory: form.mandatory,
    isPublished: form.isPublished,
  });

  const save = async () => {
    if (!form.version.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      if (editing) await adminApi.updateAppUpdate(editing.id, payload());
      else await adminApi.createAppUpdate(payload());
      setEditing(null);
      setForm(emptyForm);
      setShowForm(false);
      await reload();
      setMessage("Release saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to save release.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (release: AppUpdateRelease) => {
    setMessage(null);
    try {
      if (release.isPublished) await adminApi.unpublishAppUpdate(release.id);
      else await adminApi.publishAppUpdate(release.id);
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to update publish status.");
    }
  };

  const remove = async (release: AppUpdateRelease) => {
    if (!confirm(`Delete ${release.platform} ${release.version}?`)) return;
    setMessage(null);
    try {
      await adminApi.deleteAppUpdate(release.id);
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to delete release.");
    }
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>SYSTEM · APP UPDATES</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>App Updates</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Manage update notifications served to learner apps.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={reload}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> New release</button>
        </div>
      </div>

      {message && <div className="card mb-4" style={{ padding: 14, color: message.includes("Unable") ? "var(--ndpc-red)" : "var(--ndpc-green)" }}>{message}</div>}

      <div className="card">
        {loading && <EmptyState icon={RefreshCw} title="Loading releases" />}
        {error && <EmptyState title="Unable to load releases" description={error} action={<button className="btn" onClick={reload}>Retry</button>} />}
        {!loading && !error && releases.length === 0 && <EmptyState title="No app update releases" description="Create a release to notify apps about new versions." />}
        {!loading && !error && releases.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Platform</th><th>Version</th><th>Minimum</th><th>Status</th><th>Mandatory</th><th>Download</th><th></th></tr></thead>
              <tbody>
                {releases.map(release => (
                  <tr key={release.id}>
                    <td>{release.platform}</td>
                    <td><span className="id-mono">{release.version}</span></td>
                    <td>{release.minSupportedVersion || "-"}</td>
                    <td><StatusBadge value={release.isPublished ? "published" : "draft"} /></td>
                    <td>{release.mandatory ? "Yes" : "No"}</td>
                    <td style={{ maxWidth: 260 }}>{release.downloadUrl ? <a className="id-mono" href={release.downloadUrl} target="_blank" rel="noreferrer" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{release.downloadUrl}</a> : "-"}</td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button className="btn btn-sm" onClick={() => togglePublish(release)}><Rocket size={12} /> {release.isPublished ? "Unpublish" : "Publish"}</button>
                        <button className="btn btn-sm" onClick={() => openEdit(release)}><Edit3 size={12} /> Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(release)}><Trash2 size={12} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => { setEditing(null); setForm(emptyForm); setShowForm(false); }} title={editing ? "Edit release" : "New release"} footer={<><button className="btn" disabled={saving} onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(false); }}>Cancel</button><button className="btn btn-primary" disabled={saving || !form.version.trim()} onClick={save}>{saving ? "Saving..." : "Save release"}</button></>}>
        <div style={{ display: "grid", gap: 12 }}>
          <select className="input" value={form.platform} onChange={e => setForm(v => ({ ...v, platform: e.target.value }))}>{platforms.map(platform => <option key={platform} value={platform}>{platform}</option>)}</select>
          <input className="input" placeholder="Version e.g. 1.0.1" value={form.version} onChange={e => setForm(v => ({ ...v, version: e.target.value }))} />
          <input className="input" placeholder="Minimum supported version e.g. 1.0.0" value={form.minSupportedVersion} onChange={e => setForm(v => ({ ...v, minSupportedVersion: e.target.value }))} />
          <input className="input" placeholder="Download URL" value={form.downloadUrl} onChange={e => setForm(v => ({ ...v, downloadUrl: e.target.value }))} />
          <textarea className="input" rows={5} placeholder="Release notes, one per line" value={form.releaseNotes} onChange={e => setForm(v => ({ ...v, releaseNotes: e.target.value }))} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.mandatory} onChange={e => setForm(v => ({ ...v, mandatory: e.target.checked }))} /> Mandatory update</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublished} onChange={e => setForm(v => ({ ...v, isPublished: e.target.checked }))} /> Published</label>
        </div>
      </Modal>
    </div>
  );
}
