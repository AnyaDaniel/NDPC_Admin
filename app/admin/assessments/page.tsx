"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HelpCircle, Plus, RefreshCw, Trash2 } from "lucide-react";
import { adminApi, AdminAssessment, AdminCourse, AdminModule, AdminQuestion } from "@/lib/admin-api";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Modal } from "@/components/admin/ui/Modal";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

const TYPES = ["preCourseTest", "moduleQuiz", "moduleExam", "finalExam"] as const;
const QUESTION_TYPES = ["multipleChoice", "trueFalse", "shortAnswer", "essay", "practical"] as const;

export default function AssessmentsPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [assessments, setAssessments] = useState<AdminAssessment[]>([]);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({ title: "", type: "moduleQuiz", passingScore: 70, timeLimitMinutes: 30, maxAttempts: 3 });
  const [questionForm, setQuestionForm] = useState({ questionText: "", questionType: "multipleChoice", options: "Option A\nOption B\nOption C", correctAnswer: "", points: 1, requiresAiGrading: false });

  const selectedAssessment = useMemo(() => assessments.find(a => a.id === selectedAssessmentId), [assessments, selectedAssessmentId]);

  const loadCourses = useCallback(async () => {
    const data = await adminApi.courses({ pageSize: 100 });
    const list = data.courses ?? [];
    setCourses(list);
    setCourseId(current => current || list[0]?.id || "");
  }, []);

  const loadAssessments = useCallback(async () => {
    if (!courseId) return;
    const data = await adminApi.assessments({ courseId, moduleId: moduleId || undefined });
    const list = data.assessments ?? [];
    setAssessments(list);
    setSelectedAssessmentId(current => current || list[0]?.id || "");
  }, [courseId, moduleId]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load assessment data");
    } finally {
      setLoading(false);
    }
  }, [loadCourses]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!courseId) return;
    adminApi.modules(courseId)
      .then(data => setModules(data.modules ?? []))
      .catch(() => setModules([]));
    loadAssessments().catch(err => setError(err instanceof Error ? err.message : "Unable to load assessments"));
  }, [courseId, moduleId, loadAssessments]);

  useEffect(() => {
    if (!selectedAssessmentId) {
      setQuestions([]);
      return;
    }
    adminApi.questions(selectedAssessmentId)
      .then(data => setQuestions(data.questions ?? []))
      .catch(err => setError(err instanceof Error ? err.message : "Unable to load questions"));
  }, [selectedAssessmentId]);

  const saveAssessment = async () => {
    if (!courseId) return;
    const type = assessmentForm.type;
    const moduleScoped = type === "moduleQuiz" || type === "moduleExam";
    await adminApi.createAssessment({
      courseId,
      moduleId: moduleScoped ? moduleId : undefined,
      title: assessmentForm.title,
      type,
      passingScore: Number(assessmentForm.passingScore),
      timeLimitMinutes: Number(assessmentForm.timeLimitMinutes),
      maxAttempts: Number(assessmentForm.maxAttempts),
      allowRetake: true,
    });
    setShowAssessment(false);
    setAssessmentForm({ title: "", type: "moduleQuiz", passingScore: 70, timeLimitMinutes: 30, maxAttempts: 3 });
    await loadAssessments();
  };

  const saveQuestion = async () => {
    if (!selectedAssessmentId) return;
    const options = questionForm.questionType === "multipleChoice"
      ? questionForm.options.split("\n").map(v => v.trim()).filter(Boolean)
      : questionForm.questionType === "trueFalse"
        ? ["true", "false"]
        : undefined;
    await adminApi.createQuestion({
      assessmentId: selectedAssessmentId,
      questionText: questionForm.questionText,
      questionType: questionForm.questionType,
      options,
      correctAnswer: questionForm.correctAnswer,
      points: Number(questionForm.points),
      requiresAiGrading: questionForm.requiresAiGrading,
      orderIndex: questions.length,
    });
    setShowQuestion(false);
    setQuestionForm({ questionText: "", questionType: "multipleChoice", options: "Option A\nOption B\nOption C", correctAnswer: "", points: 1, requiresAiGrading: false });
    const data = await adminApi.questions(selectedAssessmentId);
    setQuestions(data.questions ?? []);
  };

  const removeAssessment = async (assessment: AdminAssessment) => {
    if (!confirm(`Delete ${assessment.title}?`)) return;
    await adminApi.deleteAssessment(assessment.id);
    setSelectedAssessmentId("");
    await loadAssessments();
  };

  const removeQuestion = async (question: AdminQuestion) => {
    await adminApi.deleteQuestion(question.id);
    setQuestions(items => items.filter(item => item.id !== question.id));
  };

  return (
    <div style={{ padding: "var(--density-page-pad)", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>LEARNING · ASSESSMENTS</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Tests & Exams</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Create pre-course tests, module quizzes/exams, final exams, and questions.</p>
        </div>
        <div className="flex gap-2"><button className="btn" onClick={reload}><RefreshCw size={14} /> Refresh</button><button className="btn btn-primary" onClick={() => setShowAssessment(true)} disabled={!courseId}><Plus size={14} /> New assessment</button></div>
      </div>
      <div className="card" style={{ padding: 14, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Course</span><select className="input" value={courseId} onChange={e => { setCourseId(e.target.value); setModuleId(""); setSelectedAssessmentId(""); }}>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
        <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Module filter</span><select className="input" value={moduleId} onChange={e => { setModuleId(e.target.value); setSelectedAssessmentId(""); }}><option value="">All course assessments</option>{modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></label>
      </div>
      {error && <div className="card" style={{ padding: 14, color: "var(--ndpc-red)", marginBottom: 16 }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(420px, 0.9fr) 1.1fr", gap: 16, alignItems: "start" }}>
        <div className="card">
          {loading ? <EmptyState icon={RefreshCw} title="Loading assessments" /> : assessments.length === 0 ? <EmptyState icon={HelpCircle} title="No assessments found" description="Create a test or exam for this course/module." /> : <table className="tbl"><thead><tr><th>Assessment</th><th>Type</th><th>Pass</th><th></th></tr></thead><tbody>{assessments.map(a => <tr key={a.id} onClick={() => setSelectedAssessmentId(a.id)} style={{ cursor: "pointer", background: selectedAssessmentId === a.id ? "var(--selected)" : undefined }}><td><div style={{ fontWeight: 500 }}>{a.title}</div><div className="id-mono">{a.module?.title ?? a.course?.title ?? a.id}</div></td><td><StatusBadge value="active" label={a.type} /></td><td>{a.passingScore}%</td><td><button className="btn btn-icon btn-ghost btn-sm btn-danger" onClick={e => { e.stopPropagation(); removeAssessment(a); }}><Trash2 size={13} /></button></td></tr>)}</tbody></table>}
        </div>
        <div className="card">
          <div className="flex items-center justify-between" style={{ padding: 14, borderBottom: "1px solid var(--line)" }}><div><div style={{ fontWeight: 600 }}>{selectedAssessment?.title ?? "Select an assessment"}</div><div style={{ color: "var(--ink-3)", fontSize: 12 }}>{questions.length} questions</div></div><button className="btn btn-primary" disabled={!selectedAssessmentId} onClick={() => setShowQuestion(true)}><Plus size={14} /> Add question</button></div>
          {!selectedAssessmentId ? <EmptyState title="No assessment selected" /> : questions.length === 0 ? <EmptyState title="No questions yet" /> : <table className="tbl"><thead><tr><th>Question</th><th>Type</th><th>Pts</th><th></th></tr></thead><tbody>{questions.map(q => <tr key={q.id}><td style={{ whiteSpace: "normal" }}>{q.questionText}</td><td>{q.questionType}</td><td>{q.points}</td><td><button className="btn btn-icon btn-ghost btn-sm btn-danger" onClick={() => removeQuestion(q)}><Trash2 size={13} /></button></td></tr>)}</tbody></table>}
        </div>
      </div>
      <Modal open={showAssessment} onClose={() => setShowAssessment(false)} title="New assessment" footer={<><button className="btn" onClick={() => setShowAssessment(false)}>Cancel</button><button className="btn btn-primary" disabled={!assessmentForm.title.trim()} onClick={saveAssessment}>Create</button></>}>
        <div style={{ display: "grid", gap: 12 }}><input className="input" placeholder="Assessment title" value={assessmentForm.title} onChange={e => setAssessmentForm(v => ({ ...v, title: e.target.value }))} /><select className="input" value={assessmentForm.type} onChange={e => setAssessmentForm(v => ({ ...v, type: e.target.value }))}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}><input className="input" type="number" value={assessmentForm.passingScore} onChange={e => setAssessmentForm(v => ({ ...v, passingScore: Number(e.target.value) }))} /><input className="input" type="number" value={assessmentForm.timeLimitMinutes} onChange={e => setAssessmentForm(v => ({ ...v, timeLimitMinutes: Number(e.target.value) }))} /><input className="input" type="number" value={assessmentForm.maxAttempts} onChange={e => setAssessmentForm(v => ({ ...v, maxAttempts: Number(e.target.value) }))} /></div></div>
      </Modal>
      <Modal open={showQuestion} onClose={() => setShowQuestion(false)} title="New question" footer={<><button className="btn" onClick={() => setShowQuestion(false)}>Cancel</button><button className="btn btn-primary" disabled={!questionForm.questionText.trim()} onClick={saveQuestion}>Create</button></>}>
        <div style={{ display: "grid", gap: 12 }}><textarea className="input" rows={3} placeholder="Question text" value={questionForm.questionText} onChange={e => setQuestionForm(v => ({ ...v, questionText: e.target.value }))} /><select className="input" value={questionForm.questionType} onChange={e => setQuestionForm(v => ({ ...v, questionType: e.target.value }))}>{QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>{questionForm.questionType === "multipleChoice" && <textarea className="input" rows={4} value={questionForm.options} onChange={e => setQuestionForm(v => ({ ...v, options: e.target.value }))} />}<input className="input" placeholder="Correct answer" value={questionForm.correctAnswer} onChange={e => setQuestionForm(v => ({ ...v, correctAnswer: e.target.value }))} /><input className="input" type="number" min={1} value={questionForm.points} onChange={e => setQuestionForm(v => ({ ...v, points: Number(e.target.value) }))} /><label className="flex items-center gap-2" style={{ fontSize: 13 }}><input type="checkbox" checked={questionForm.requiresAiGrading} onChange={e => setQuestionForm(v => ({ ...v, requiresAiGrading: e.target.checked }))} /> Requires AI/manual grading</label></div>
      </Modal>
    </div>
  );
}
