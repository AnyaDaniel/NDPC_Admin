import { apiRequest, setAdminSession } from "./api-client";

import { ApiError, getAccessToken } from "./api-client";

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  phoneNumber?: string | null;
  role: string;
  maxDevices?: number;
  isEmailVerified?: boolean;
  createdAt?: string;
  activeDevicesCount?: number;
};

export type Paginated<TName extends string, T> = Record<TName, T[]> & {
  total: number;
  page: number;
  pageSize: number;
};

export type AdminAssessment = {
  id: string;
  courseId: string;
  moduleId?: string | null;
  title: string;
  description?: string | null;
  type: "preCourseTest" | "moduleQuiz" | "moduleExam" | "finalExam" | string;
  timeLimitMinutes?: number | null;
  passingScore: number;
  allowRetake: boolean;
  maxAttempts: number;
  course?: { title: string };
  module?: { title: string } | null;
  questions?: { id: string }[];
  _count?: { attempts: number };
};

export type AdminQuestion = {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: "multipleChoice" | "trueFalse" | "shortAnswer" | "essay" | "practical" | string;
  options?: unknown;
  correctAnswer?: string | null;
  points: number;
  requiresAiGrading: boolean;
  orderIndex: number;
};

export type AdminCourse = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  difficulty?: "beginner" | "intermediate" | "advanced" | string | null;
  durationHours?: number | null;
  thumbnailUrl?: string | null;
  isPublished?: boolean;
  modulesCount?: number;
  enrolledCount?: number;
  createdAt?: string;
};

export type AdminModule = {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  introduction?: string | null;
  orderIndex: number;
  hasAITester?: boolean;
  lessons?: { id: string }[];
};

export type AdminLesson = {
  id: string;
  moduleId: string;
  title: string;
  contentType: "video" | "text" | "pdf" | "interactive" | string;
  contentUrl?: string | null;
  storageProvider?: string | null;
  storageKey?: string | null;
  mimeType?: string | null;
  allowOffline?: boolean;
  isEncryptedAsset?: boolean;
  durationMinutes?: number | null;
  orderIndex: number;
};

export type DeviceLog = {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  deviceCode?: string | null;
  ipAddress?: string | null;
  timestamp: string;
};

export type UploadResult = {
  kind: string;
  fileName: string;
  sizeBytes: number;
  contentType: string;
  contentUrl: string;
  publicUrl?: string;
  storageProvider: string;
  storageKey: string;
  mimeType: string;
  lessonDefaults: Partial<AdminLesson> & { allowOffline?: boolean; isEncryptedAsset?: boolean; publicUrl?: string };
};

export type Certificate = Record<string, unknown> & {
  id?: string;
  certificateNumber?: string;
  learnerName?: string;
  courseTitle?: string;
  issuedAt?: string;
  status?: string;
  pdfUrl?: string | null;
  verificationUrl?: string;
};

export const adminApi = {
  async login(email: string, password: string) {
    const data = await apiRequest<{ accessToken?: string; token?: string; refreshToken?: string; user: { role: string; email: string; name?: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, twoFactorMethod: "email" }),
    });
    const role = String(data.user?.role ?? "").toLowerCase();
    if (role !== "admin") throw new Error("This dashboard requires an admin account.");
    const accessToken = data.accessToken ?? data.token;
    if (!accessToken) throw new Error("Login succeeded but no access token was returned.");
    const session = { ...data, accessToken };
    setAdminSession(session);
    return session;
  },

  users(params: { page?: number; pageSize?: number; search?: string; role?: string } = {}) {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "") as [string, string][]).toString();
    return apiRequest<Paginated<"users", AdminUser>>(`/admin/users${q ? `?${q}` : ""}`);
  },

  async createActivationCodes(payload: { count: number; maxUses: number; expiresInDays: number }, options: { signal?: AbortSignal } = {}) {
    const token = getAccessToken();
    const response = await fetch("/api/admin/activation-codes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: options.signal,
    });
    const envelope = await response.json().catch(() => null) as {
      success?: boolean;
      message?: string;
      data?: { codes: { code: string; maxUses: number; expiresAt: string }[] };
      error?: { code?: string; message?: string; details?: unknown };
    } | null;
    if (!response.ok || envelope?.success === false) {
      throw new ApiError(
        envelope?.error?.message || envelope?.message || response.statusText || "Unable to generate activation codes",
        response.status,
        envelope?.error?.code,
        envelope?.error?.details
      );
    }
    if (!envelope?.data) throw new Error("Activation-code response was empty.");
    return envelope.data;
  },

  deviceLogs(params: { page?: number; pageSize?: number; userId?: string; startDate?: string } = {}) {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "") as [string, string][]).toString();
    return apiRequest<Paginated<"logs", DeviceLog>>(`/admin/device-logs${q ? `?${q}` : ""}`);
  },

  courses(params: { page?: number; pageSize?: number; search?: string; published?: boolean } = {}) {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "") as [string, string][]).toString();
    return apiRequest<Paginated<"courses", AdminCourse>>(`/admin/courses${q ? `?${q}` : ""}`);
  },
  createCourse(payload: Partial<AdminCourse>) {
    return apiRequest<{ course: AdminCourse }>("/admin/courses", { method: "POST", body: JSON.stringify(payload) });
  },
  updateCourse(id: string, payload: Partial<AdminCourse>) {
    return apiRequest<{ course: AdminCourse }>(`/admin/courses/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteCourse(id: string) {
    return apiRequest<void>(`/admin/courses/${id}`, { method: "DELETE" });
  },

  modules(courseId: string) {
    return apiRequest<{ modules: AdminModule[] }>(`/admin/courses/${courseId}/modules`);
  },
  createModule(payload: Partial<AdminModule>) {
    return apiRequest<{ module: AdminModule }>("/admin/modules", { method: "POST", body: JSON.stringify(payload) });
  },
  updateModule(id: string, payload: Partial<AdminModule>) {
    return apiRequest<{ module: AdminModule }>(`/admin/modules/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteModule(id: string) {
    return apiRequest<void>(`/admin/modules/${id}`, { method: "DELETE" });
  },

  lessons(moduleId: string) {
    return apiRequest<{ lessons: AdminLesson[] }>(`/admin/modules/${moduleId}/lessons`);
  },
  createLesson(payload: Partial<AdminLesson>) {
    return apiRequest<{ lesson: AdminLesson }>("/admin/lessons", { method: "POST", body: JSON.stringify(payload) });
  },
  updateLesson(id: string, payload: Partial<AdminLesson>) {
    return apiRequest<{ lesson: AdminLesson }>(`/admin/lessons/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteLesson(id: string) {
    return apiRequest<void>(`/admin/lessons/${id}`, { method: "DELETE" });
  },

  upload(kind: "video" | "pdf" | "material", file: File) {
    return apiRequest<UploadResult>(`/admin/uploads?kind=${kind}`, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream", "x-file-name": file.name },
      body: file,
    });
  },

  startAiSession(payload: { courseId: string; moduleId?: string; topic?: string }) {
    return apiRequest<{ sessionId: string; openingMessage?: unknown }>("/ai-tester/sessions", { method: "POST", body: JSON.stringify(payload) });
  },
  sendAiMessage(sessionId: string, message: string) {
    return apiRequest(`/ai-tester/sessions/${sessionId}/messages`, { method: "POST", body: JSON.stringify({ message }) });
  },
  finalAiAssessment(sessionId: string) {
    return apiRequest(`/ai-tester/sessions/${sessionId}/final-assessment`, { method: "POST", body: JSON.stringify({}) });
  },

  assessments(params: { courseId?: string; moduleId?: string } = {}) {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "") as [string, string][]).toString();
    return apiRequest<{ assessments: AdminAssessment[] }>(`/admin/assessments${q ? `?${q}` : ""}`);
  },
  createAssessment(payload: Partial<AdminAssessment>) {
    return apiRequest<{ assessment: AdminAssessment }>("/admin/assessments", { method: "POST", body: JSON.stringify(payload) });
  },
  updateAssessment(id: string, payload: Partial<AdminAssessment>) {
    return apiRequest<{ assessment: AdminAssessment }>(`/admin/assessments/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteAssessment(id: string) {
    return apiRequest<void>(`/admin/assessments/${id}`, { method: "DELETE" });
  },
  questions(assessmentId: string) {
    return apiRequest<{ questions: AdminQuestion[] }>(`/admin/assessments/${assessmentId}/questions`);
  },
  createQuestion(payload: Partial<AdminQuestion>) {
    return apiRequest<{ question: AdminQuestion }>("/admin/questions", { method: "POST", body: JSON.stringify(payload) });
  },
  updateQuestion(id: string, payload: Partial<AdminQuestion>) {
    return apiRequest<{ question: AdminQuestion }>(`/admin/questions/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteQuestion(id: string) {
    return apiRequest<void>(`/admin/questions/${id}`, { method: "DELETE" });
  },

  certificates() { return apiRequest<{ certificates: Certificate[] }>("/admin/certificates"); },
  certificate(id: string) { return apiRequest<{ certificate: Certificate }>(`/certificates/${id}`); },
  generateCertificate(courseId: string) { return apiRequest<{ certificate: Certificate }>("/certificates/generate", { method: "POST", body: JSON.stringify({ courseId }) }); },
  async verifyCertificate(certificateNumber: string) {
    const data = await apiRequest<{ certificate: Certificate }>(`/certificates/verify/${encodeURIComponent(certificateNumber)}`);
    return data.certificate;
  },
};
