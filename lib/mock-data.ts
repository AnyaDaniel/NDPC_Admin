// TODO: Replace with real API calls

export const NAIRA = (n: number) => "₦" + n.toLocaleString();

export const USERS = [
  { id: "USR-10342", name: "Adaeze Okafor",   email: "adaeze.okafor@gmail.com",   role: "Learner",  status: "active",    devices: 2, joined: "2025-08-12", courses: 4, certs: 2, plan: "Annual",  spend: 96000 },
  { id: "USR-10341", name: "Tunde Bakare",    email: "t.bakare@outlook.com",      role: "Learner",  status: "active",    devices: 1, joined: "2025-09-04", courses: 3, certs: 1, plan: "Monthly", spend: 12000 },
  { id: "USR-10340", name: "Chiamaka Eze",    email: "chi.eze@yahoo.com",         role: "Learner",  status: "suspended", devices: 3, joined: "2025-07-21", courses: 2, certs: 0, plan: "Annual",  spend: 96000 },
  { id: "USR-10339", name: "Olumide Shittu",  email: "olumide.s@ndpc.ng",         role: "Tutor",    status: "active",    devices: 1, joined: "2024-11-18", courses: 9, certs: 0, plan: "Tutor",   spend: 0 },
  { id: "USR-10338", name: "Halima Yusuf",    email: "halima.y@gmail.com",        role: "Learner",  status: "active",    devices: 2, joined: "2025-10-30", courses: 5, certs: 3, plan: "Annual",  spend: 96000 },
  { id: "USR-10337", name: "Emeka Nwosu",     email: "emeka.nw@hotmail.com",      role: "Learner",  status: "pending",   devices: 0, joined: "2026-01-05", courses: 0, certs: 0, plan: "—",       spend: 0 },
  { id: "USR-10336", name: "Funke Adeyemi",   email: "funke.a@gmail.com",         role: "Learner",  status: "active",    devices: 2, joined: "2025-12-19", courses: 6, certs: 4, plan: "Annual",  spend: 96000 },
  { id: "USR-10335", name: "Ibrahim Musa",    email: "ibrahim.musa@gmail.com",    role: "Learner",  status: "active",    devices: 1, joined: "2025-06-02", courses: 2, certs: 1, plan: "Monthly", spend: 24000 },
  { id: "USR-10334", name: "Ngozi Obi",       email: "ngozi.obi@gmail.com",       role: "Learner",  status: "suspended", devices: 2, joined: "2024-12-11", courses: 1, certs: 0, plan: "Annual",  spend: 96000 },
  { id: "USR-10333", name: "Sade Ojo",        email: "sade.ojo@gmail.com",        role: "Learner",  status: "active",    devices: 1, joined: "2025-11-09", courses: 7, certs: 5, plan: "Annual",  spend: 96000 },
  { id: "USR-10332", name: "Babatunde Lawal", email: "babs.lawal@gmail.com",      role: "Learner",  status: "active",    devices: 2, joined: "2025-04-22", courses: 3, certs: 2, plan: "Monthly", spend: 36000 },
  { id: "USR-10331", name: "Aisha Bello",     email: "aisha.bello@gmail.com",     role: "Learner",  status: "pending",   devices: 0, joined: "2026-02-14", courses: 0, certs: 0, plan: "—",       spend: 0 },
];

export const DEVICES = [
  { id: "DVC-8821", user: "Adaeze Okafor",   uid: "USR-10342", name: "iPhone 14 Pro",   platform: "iOS 17.4",    status: "active",      last: "2 min ago",   ip: "102.89.34.12 · Lagos",  lat: 6.5244,  lng: 3.3792,  city: "Lagos"  },
  { id: "DVC-8820", user: "Adaeze Okafor",   uid: "USR-10342", name: "MacBook Air M2",  platform: "macOS 14.3",  status: "active",      last: "1 hr ago",    ip: "102.89.34.12 · Lagos",  lat: 6.5244,  lng: 3.3792,  city: "Lagos"  },
  { id: "DVC-8819", user: "Tunde Bakare",    uid: "USR-10341", name: "Samsung A54",     platform: "Android 14",  status: "active",      last: "5 min ago",   ip: "197.210.55.4 · Abuja",  lat: 9.0579,  lng: 7.4951,  city: "Abuja"  },
  { id: "DVC-8818", user: "Chiamaka Eze",    uid: "USR-10340", name: "Tecno Spark 10",  platform: "Android 13",  status: "suspended",   last: "3 days ago",  ip: "105.112.21.7 · Enugu",  lat: 6.4584,  lng: 7.5464,  city: "Enugu"  },
  { id: "DVC-8817", user: "Chiamaka Eze",    uid: "USR-10340", name: "Infinix Note 30", platform: "Android 13",  status: "suspended",   last: "5 days ago",  ip: "105.112.21.7 · Enugu",  lat: 6.4584,  lng: 7.5464,  city: "Enugu"  },
  { id: "DVC-8816", user: "Halima Yusuf",    uid: "USR-10338", name: "iPad 10",         platform: "iPadOS 17.4", status: "active",      last: "12 min ago",  ip: "41.58.180.2 · Kano",    lat: 12.0022, lng: 8.5920,  city: "Kano"   },
  { id: "DVC-8815", user: "Halima Yusuf",    uid: "USR-10338", name: "iPhone 12",       platform: "iOS 17.3",    status: "active",      last: "30 min ago",  ip: "41.58.180.2 · Kano",    lat: 12.0022, lng: 8.5920,  city: "Kano"   },
  { id: "DVC-8814", user: "Olumide Shittu",  uid: "USR-10339", name: "Dell XPS 13",     platform: "Windows 11",  status: "active",      last: "Just now",    ip: "129.205.7.20 · Ibadan", lat: 7.3775,  lng: 3.9470,  city: "Ibadan" },
  { id: "DVC-8813", user: "Ngozi Obi",       uid: "USR-10334", name: "Redmi Note 12",   platform: "Android 13",  status: "deactivated", last: "2 wks ago",   ip: "105.112.55.9 · Owerri", lat: 5.4836,  lng: 7.0346,  city: "Owerri" },
  { id: "DVC-8812", user: "Funke Adeyemi",   uid: "USR-10336", name: "iPhone 15",       platform: "iOS 17.4",    status: "active",      last: "8 min ago",   ip: "102.89.55.3 · Lagos",   lat: 6.5244,  lng: 3.3792,  city: "Lagos"  },
  { id: "DVC-8811", user: "Ibrahim Musa",    uid: "USR-10335", name: "Itel A56",        platform: "Android 12",  status: "active",      last: "4 hrs ago",   ip: "197.211.4.2 · Kaduna",  lat: 10.5227, lng: 7.4394,  city: "Kaduna" },
  { id: "DVC-8810", user: "Sade Ojo",        uid: "USR-10333", name: "Galaxy S22",      platform: "Android 14",  status: "active",      last: "20 min ago",  ip: "102.89.4.110 · Lagos",  lat: 6.5244,  lng: 3.3792,  city: "Lagos"  },
];

export const SUBSCRIPTIONS = [
  { id: "SUB-44021", user: "Adaeze Okafor",   plan: "Annual Pro",  amount: 96000, status: "active",    start: "2025-08-12", end: "2026-08-12", auto: true },
  { id: "SUB-44020", user: "Tunde Bakare",    plan: "Monthly Pro", amount: 12000, status: "active",    start: "2026-04-01", end: "2026-05-01", auto: true },
  { id: "SUB-44019", user: "Chiamaka Eze",    plan: "Annual Pro",  amount: 96000, status: "expired",   start: "2024-07-21", end: "2025-07-21", auto: false },
  { id: "SUB-44018", user: "Halima Yusuf",    plan: "Annual Pro",  amount: 96000, status: "active",    start: "2025-10-30", end: "2026-10-30", auto: true },
  { id: "SUB-44017", user: "Emeka Nwosu",     plan: "Annual Pro",  amount: 96000, status: "pending",   start: "—",         end: "—",          auto: false },
  { id: "SUB-44016", user: "Funke Adeyemi",   plan: "Annual Pro",  amount: 96000, status: "active",    start: "2025-12-19", end: "2026-12-19", auto: true },
  { id: "SUB-44015", user: "Ibrahim Musa",    plan: "Monthly Pro", amount: 12000, status: "active",    start: "2026-04-15", end: "2026-05-15", auto: false },
  { id: "SUB-44014", user: "Ngozi Obi",       plan: "Annual Pro",  amount: 96000, status: "cancelled", start: "2024-12-11", end: "2025-12-11", auto: false },
  { id: "SUB-44013", user: "Sade Ojo",        plan: "Annual Pro",  amount: 96000, status: "active",    start: "2025-11-09", end: "2026-11-09", auto: true },
  { id: "SUB-44012", user: "Babatunde Lawal", plan: "Monthly Pro", amount: 12000, status: "active",    start: "2026-04-22", end: "2026-05-22", auto: true },
];

export const PAYMENTS = [
  { id: "PAY-7732981", user: "Adaeze Okafor",   amount: 96000, channel: "Paystack",    status: "success", date: "2025-08-12 14:22", ref: "ps_8821x",  sub: "SUB-44021" },
  { id: "PAY-7732982", user: "Tunde Bakare",    amount: 12000, channel: "Flutterwave", status: "success", date: "2026-04-01 09:11", ref: "flw_xb22",  sub: "SUB-44020" },
  { id: "PAY-7732983", user: "Emeka Nwosu",     amount: 96000, channel: "Paystack",    status: "pending", date: "2026-05-08 11:50", ref: "ps_99xa1",  sub: "—" },
  { id: "PAY-7732984", user: "Halima Yusuf",    amount: 96000, channel: "Bank Tx.",    status: "success", date: "2025-10-30 17:02", ref: "BTX-99812", sub: "SUB-44018" },
  { id: "PAY-7732985", user: "Aisha Bello",     amount: 96000, channel: "Paystack",    status: "failed",  date: "2026-05-10 08:31", ref: "ps_11xa9",  sub: "—", reason: "Insufficient funds" },
  { id: "PAY-7732986", user: "Ibrahim Musa",    amount: 12000, channel: "Flutterwave", status: "success", date: "2026-04-15 19:44", ref: "flw_kk44",  sub: "SUB-44015" },
  { id: "PAY-7732987", user: "Chiamaka Eze",    amount: 96000, channel: "Paystack",    status: "failed",  date: "2025-07-21 22:11", ref: "ps_18xa3",  sub: "—", reason: "Card declined" },
  { id: "PAY-7732988", user: "Funke Adeyemi",   amount: 96000, channel: "Paystack",    status: "success", date: "2025-12-19 09:33", ref: "ps_24bb2",  sub: "SUB-44016" },
  { id: "PAY-7732989", user: "Sade Ojo",        amount: 96000, channel: "Bank Tx.",    status: "success", date: "2025-11-09 12:08", ref: "BTX-66432", sub: "SUB-44013" },
  { id: "PAY-7732990", user: "Babatunde Lawal", amount: 12000, channel: "Flutterwave", status: "pending", date: "2026-05-09 18:50", ref: "flw_77zz1", sub: "SUB-44012" },
];

export const CODES = [
  { id: "AC-001", code: "NDPC-AB12-CD34-EF56", uses: 0,  max: 1,  expires: "2026-08-01", status: "unused",      created: "2026-05-01", by: "S. Adekunle" },
  { id: "AC-002", code: "NDPC-QR99-XX22-LL01", uses: 1,  max: 1,  expires: "2026-06-30", status: "used",        created: "2026-04-12", by: "S. Adekunle" },
  { id: "AC-003", code: "NDPC-WK22-MM33-TT54", uses: 4,  max: 5,  expires: "2026-12-31", status: "active",      created: "2026-03-04", by: "K. Iroha" },
  { id: "AC-004", code: "NDPC-ZL44-PP09-RR12", uses: 0,  max: 1,  expires: "2025-12-01", status: "expired",     created: "2025-09-10", by: "K. Iroha" },
  { id: "AC-005", code: "NDPC-MK87-FT19-GH02", uses: 0,  max: 1,  expires: "2026-09-12", status: "unused",      created: "2026-05-02", by: "S. Adekunle" },
  { id: "AC-006", code: "NDPC-OL01-DR55-NN78", uses: 25, max: 50, expires: "2027-01-01", status: "active",      created: "2026-02-15", by: "K. Iroha" },
  { id: "AC-007", code: "NDPC-BV03-PD44-OQ81", uses: 0,  max: 1,  expires: "2026-07-01", status: "deactivated", created: "2026-04-29", by: "S. Adekunle" },
];

export const COURSES = [
  { id: "CRS-201", title: "Foundations of Nigerian Tax Law",  cat: "Compliance",    diff: "Beginner",     duration: "8h 20m", modules: 6, lessons: 32, enrolled: 1284, published: true },
  { id: "CRS-202", title: "Data Protection & NDPR Practice",  cat: "Privacy",       diff: "Intermediate", duration: "6h 10m", modules: 5, lessons: 24, enrolled: 982,  published: true },
  { id: "CRS-203", title: "Public Procurement Essentials",    cat: "Public Sector", diff: "Beginner",     duration: "4h 45m", modules: 4, lessons: 18, enrolled: 542,  published: true },
  { id: "CRS-204", title: "AI Ethics for Practitioners",      cat: "Technology",    diff: "Advanced",     duration: "5h 30m", modules: 5, lessons: 22, enrolled: 311,  published: false },
  { id: "CRS-205", title: "Customer Service Excellence",      cat: "Soft Skills",   diff: "Beginner",     duration: "3h 15m", modules: 3, lessons: 14, enrolled: 1822, published: true },
  { id: "CRS-206", title: "Financial Reporting (IFRS)",       cat: "Finance",       diff: "Intermediate", duration: "9h 00m", modules: 7, lessons: 41, enrolled: 645,  published: true },
];

export const UPLOADS = [
  { id: "UPL-501", name: "Tax Law - Module 1 Intro.mp4",       type: "video", size: "1.2 GB", course: "CRS-201", status: "processed", uploaded: "2026-05-10" },
  { id: "UPL-502", name: "NDPR Compliance Checklist.pdf",      type: "pdf",   size: "420 KB", course: "CRS-202", status: "processed", uploaded: "2026-05-09" },
  { id: "UPL-503", name: "Procurement Glossary.pdf",           type: "pdf",   size: "180 KB", course: "CRS-203", status: "processed", uploaded: "2026-05-08" },
  { id: "UPL-504", name: "AI Ethics Lecture 2.mp4",            type: "video", size: "2.4 GB", course: "CRS-204", status: "processing", uploaded: "2026-05-12" },
  { id: "UPL-505", name: "Customer Service Role Plays.mp4",   type: "video", size: "800 MB", course: "CRS-205", status: "processed", uploaded: "2026-05-07" },
  { id: "UPL-506", name: "IFRS Slides Deck.pdf",               type: "pdf",   size: "5.2 MB", course: "CRS-206", status: "processed", uploaded: "2026-05-06" },
  { id: "UPL-507", name: "Quiz Bank - Tax Q3.json",            type: "quiz",  size: "22 KB",  course: "CRS-201", status: "failed",    uploaded: "2026-05-11" },
];

export const CERTIFICATES = [
  { id: "CERT-NDPC-2026-00184", user: "Adaeze Okafor",   course: "Foundations of Nigerian Tax Law",  issued: "2026-03-12", score: 92, status: "valid" },
  { id: "CERT-NDPC-2026-00183", user: "Halima Yusuf",    course: "Data Protection & NDPR Practice",  issued: "2026-03-11", score: 88, status: "valid" },
  { id: "CERT-NDPC-2026-00182", user: "Sade Ojo",        course: "Customer Service Excellence",       issued: "2026-03-10", score: 95, status: "valid" },
  { id: "CERT-NDPC-2026-00181", user: "Funke Adeyemi",   course: "Financial Reporting (IFRS)",        issued: "2026-02-28", score: 81, status: "valid" },
  { id: "CERT-NDPC-2026-00180", user: "Tunde Bakare",    course: "Public Procurement Essentials",     issued: "2026-02-15", score: 78, status: "valid" },
  { id: "CERT-NDPC-2026-00179", user: "Babatunde Lawal", course: "Customer Service Excellence",       issued: "2026-02-12", score: 90, status: "revoked" },
];

export const AUDIT_LOGS = [
  { at: "2026-05-12 09:42", actor: "h.oloye@ndpc.ng",   action: "Suspended user",               target: "USR-10334 Ngozi Obi",     ip: "102.89.34.12", scope: "user" },
  { at: "2026-05-12 09:31", actor: "system",          action: "Payment auto-resolved",         target: "PAY-7732988",             ip: "—",            scope: "payment" },
  { at: "2026-05-12 08:50", actor: "kemi@ndpc.ng",    action: "Generated 50 activation codes", target: "AC-006 batch",            ip: "129.205.7.20", scope: "code" },
  { at: "2026-05-12 08:11", actor: "olumide@ndpc.ng", action: "Published course",              target: "CRS-202 NDPR Practice",   ip: "129.205.7.20", scope: "content" },
  { at: "2026-05-11 22:14", actor: "system",          action: "Failed AI tester request",      target: "AIS-9917",                ip: "—",            scope: "ai" },
  { at: "2026-05-11 20:33", actor: "h.oloye@ndpc.ng",   action: "Reset device activation",       target: "USR-10342 Adaeze Okafor", ip: "102.89.34.12", scope: "device" },
  { at: "2026-05-11 18:02", actor: "kemi@ndpc.ng",    action: "Rectified payment",             target: "PAY-7732984",             ip: "129.205.7.20", scope: "payment" },
  { at: "2026-05-11 16:50", actor: "olumide@ndpc.ng", action: "Uploaded video",                target: "LSN-04 Filing Cycles",    ip: "129.205.7.20", scope: "content" },
  { at: "2026-05-11 11:20", actor: "h.oloye@ndpc.ng",   action: "Revoked certificate",           target: "CERT-NDPC-2026-00179",    ip: "102.89.34.12", scope: "cert" },
  { at: "2026-05-11 09:00", actor: "h.oloye@ndpc.ng",   action: "Login",                         target: "Super Admin",             ip: "102.89.34.12", scope: "auth" },
];

export const RECOVERY_REQUESTS = [
  { id: "REC-001", user: "Chiamaka Eze",  email: "chi.eze@yahoo.com",      type: "Password reset",    status: "pending",  requested: "2026-05-12 08:10", reason: "Forgot password" },
  { id: "REC-002", user: "Emeka Nwosu",  email: "emeka.nw@hotmail.com",   type: "Locked account",    status: "pending",  requested: "2026-05-12 07:45", reason: "5 failed login attempts" },
  { id: "REC-003", user: "Aisha Bello",  email: "aisha.bello@gmail.com",  type: "Device reset",      status: "approved", requested: "2026-05-11 21:30", reason: "Lost phone" },
  { id: "REC-004", user: "Ngozi Obi",    email: "ngozi.obi@gmail.com",    type: "Password reset",    status: "rejected", requested: "2026-05-11 14:20", reason: "Suspicious activity" },
  { id: "REC-005", user: "Ibrahim Musa", email: "ibrahim.musa@gmail.com", type: "Failed login recovery", status: "pending", requested: "2026-05-10 19:55", reason: "Account locked after 10 attempts" },
];

export const RESET_REQUESTS = [
  { id: "RST-001", user: "Chiamaka Eze",  type: "Password reset",         status: "pending",   initiated: "2026-05-12 08:10", initiatedBy: "User" },
  { id: "RST-002", user: "Ngozi Obi",    type: "Force password reset",   status: "completed", initiated: "2026-05-11 10:00", initiatedBy: "h.oloye@ndpc.ng" },
  { id: "RST-003", user: "Emeka Nwosu",  type: "Device activation reset",status: "pending",   initiated: "2026-05-12 07:45", initiatedBy: "User" },
  { id: "RST-004", user: "Aisha Bello",  type: "Password reset",         status: "expired",   initiated: "2026-05-09 12:00", initiatedBy: "User" },
  { id: "RST-005", user: "Tunde Bakare", type: "Force password reset",   status: "completed", initiated: "2026-05-08 15:30", initiatedBy: "kemi@ndpc.ng" },
];

export const ACTIVITY_FEED = [
  { kind: "user",    text: "**Adaeze Okafor** activated a new device — *iPhone 14 Pro*",         time: "2m ago" },
  { kind: "payment", text: "Payment **₦96,000** succeeded — *Halima Yusuf · Annual Pro*",        time: "8m ago" },
  { kind: "code",    text: "Activation code **NDPC-QR99-XX22-LL01** was redeemed",               time: "14m ago" },
  { kind: "cert",    text: "Certificate **CERT-NDPC-2026-00184** issued to *Adaeze Okafor*",    time: "22m ago" },
  { kind: "device",  text: "**Chiamaka Eze** flagged: 3 active devices (limit 2)",               time: "1h ago" },
  { kind: "course",  text: "Course **NDPR Practice** published by Olumide Shittu",               time: "3h ago" },
  { kind: "payment", text: "Payment **₦96,000** failed — *Aisha Bello* — Card declined",        time: "4h ago" },
];

export const ADMINS = [
  { id: "ADM-001", name: "Harrison Oloye",   email: "h.oloye@ndpc.ng",        role: "Super Admin", status: "active",    last: "Just now",   joined: "2023-06-01", twofa: true,  permissions: ["all"] },
  { id: "ADM-002", name: "Kemi Iroha",       email: "k.iroha@ndpc.ng",        role: "Admin",       status: "active",    last: "2 hrs ago",  joined: "2024-01-15", twofa: true,  permissions: ["users","courses","payments","certificates"] },
  { id: "ADM-003", name: "Chidi Okonkwo",    email: "c.okonkwo@ndpc.ng",      role: "Moderator",   status: "active",    last: "1 day ago",  joined: "2024-03-22", twofa: false, permissions: ["courses","uploads"] },
  { id: "ADM-004", name: "Fatima Abdullahi", email: "f.abdullahi@ndpc.ng",    role: "Admin",       status: "suspended", last: "3 days ago", joined: "2023-11-08", twofa: false, permissions: ["users","devices"] },
  { id: "ADM-005", name: "Rotimi Afolabi",   email: "r.afolabi@ndpc.ng",      role: "Moderator",   status: "active",    last: "30 min ago", joined: "2025-01-10", twofa: true,  permissions: ["certificates","audit-logs"] },
  { id: "ADM-006", name: "Ngozi Adeyinka",   email: "n.adeyinka@ndpc.ng",     role: "Viewer",      status: "active",    last: "4 hrs ago",  joined: "2025-07-22", twofa: false, permissions: ["audit-logs"] },
];

export const STUDY_LEADERS = [
  { user: "Sade Ojo",        hours: 42.5, streak: 21, lessons: 184, lastSeen: "2 min ago" },
  { user: "Adaeze Okafor",  hours: 38.1, streak: 14, lessons: 162, lastSeen: "5 min ago" },
  { user: "Halima Yusuf",   hours: 35.0, streak: 10, lessons: 148, lastSeen: "12 min ago" },
  { user: "Funke Adeyemi",  hours: 31.2, streak: 9,  lessons: 132, lastSeen: "30 min ago" },
  { user: "Babatunde Lawal",hours: 28.8, streak: 6,  lessons: 118, lastSeen: "1 hr ago" },
];
