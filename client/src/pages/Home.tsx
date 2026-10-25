import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Download,
  FileBarChart,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Moon,
  Pencil,
  Plus,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  defaultSettings,
  departments,
  examinations,
  initialMarks,
  initialStudents,
  initialSubjects,
  type InstitutionSettings,
  type MarkRecord,
  type Student,
  type Subject,
} from "@/data/demo";
import { calculateGrade, formatPercent, initials, type GradeResult } from "@/lib/grade";

type NavItem = { label: string; path: string; icon: typeof LayoutDashboard; section?: string };
type StudentSummary = Student & { percentage: number; result: "PASS" | "FAIL"; grade: string; subjectsPassed: number; subjectsFailed: number };

const navItems: NavItem[] = [
  { label: "Overview", path: "/", icon: LayoutDashboard, section: "WORKSPACE" },
  { label: "Students", path: "/students", icon: Users },
  { label: "Subjects", path: "/subjects", icon: BookOpen },
  { label: "Marks entry", path: "/marks", icon: ClipboardCheck },
  { label: "Results", path: "/results", icon: FileCheck2, section: "REPORTING" },
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings, section: "ADMINISTRATION" },
  { label: "User management", path: "/users", icon: ShieldCheck },
];

const routeTitles: Record<string, { eyebrow: string; title: string; description: string }> = {
  "/": { eyebrow: "Academic operations", title: "Good morning, Priya", description: "Keep every result ready for review." },
  "/students": { eyebrow: "Directory", title: "Students", description: "Manage student profiles and academic identity." },
  "/subjects": { eyebrow: "Curriculum", title: "Subjects", description: "Keep assessment structure consistent across cohorts." },
  "/marks": { eyebrow: "Assessment desk", title: "Marks entry", description: "Capture, validate, and publish scores with confidence." },
  "/results": { eyebrow: "Academic record", title: "Results", description: "Review outcomes and open an individual report card." },
  "/reports": { eyebrow: "Publishing", title: "Reports", description: "Generate the right report for every audience." },
  "/analytics": { eyebrow: "Performance intelligence", title: "Analytics", description: "See where the cohort is thriving and where support is needed." },
  "/settings": { eyebrow: "Institution control", title: "Settings", description: "Configure the rules that shape every result." },
  "/users": { eyebrow: "Access control", title: "User management", description: "Keep roles clear and academic data private." },
};

const palette = ["#2dd4bf", "#38bdf8", "#8b5cf6", "#f59e0b", "#fb7185", "#64748b"];

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map(row => headers.map(header => JSON.stringify(row[header] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} downloaded`);
}

function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "positive" | "warning" | "danger" | "neutral" | "info" }) {
  return <span className={`pill pill-${tone}`}><span className="pill-dot" />{children}</span>;
}

function Avatar({ student, size = "md" }: { student: Student; size?: "sm" | "md" | "lg" }) {
  return <span className={`avatar avatar-${size}`} style={{ background: `${student.color}22`, color: student.color }}>{initials(student.name)}</span>;
}

function MetricCard({ icon: Icon, label, value, detail, tone = "mint", trend }: { icon: typeof Users; label: string; value: string; detail: string; tone?: string; trend?: string }) {
  return <div className="metric-card">
    <div className={`metric-icon metric-${tone}`}><Icon size={18} /></div>
    <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small className={trend ? "trend-up" : ""}>{trend ? <ArrowUpRight size={12} /> : null}{detail}</small></div>
  </div>;
}

function SectionHeader({ title, action, children }: { title: string; action?: ReactNode; children?: ReactNode }) {
  return <div className="section-header"><div><h2>{title}</h2>{children ? <p>{children}</p> : null}</div>{action}</div>;
}

function EmptyState({ icon: Icon, title, description, action }: { icon: typeof FileText; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={22} /></div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const [students, setStudents] = useState<Student[]>(() => readStored("gradepilot.v2.students", initialStudents));
  const [subjects, setSubjects] = useState<Subject[]>(() => readStored("gradepilot.v2.subjects", initialSubjects));
  const [marks, setMarks] = useState<MarkRecord[]>(() => readStored("gradepilot.v2.marks", initialMarks));
  const [settings, setSettings] = useState<InstitutionSettings>(() => readStored("gradepilot.v2.settings", defaultSettings));
  const [dark, setDark] = useState(() => readStored("gradepilot.v2.dark", false));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [studentModal, setStudentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem("gradepilot.v2.students", JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem("gradepilot.v2.subjects", JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem("gradepilot.v2.marks", JSON.stringify(marks)); }, [marks]);
  useEffect(() => { localStorage.setItem("gradepilot.v2.settings", JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem("gradepilot.v2.dark", JSON.stringify(dark)); document.documentElement.classList.toggle("dark", dark); }, [dark]);

  const summaries = useMemo<StudentSummary[]>(() => students.map(student => {
    const studentMarks = marks.filter(mark => mark.studentId === student.id);
    let total = 0;
    let maximum = 0;
    let subjectsPassed = 0;
    let subjectsFailed = 0;
    studentMarks.forEach(mark => {
      const subject = subjects.find(item => item.id === mark.subjectId);
      if (!subject) return;
      const result = calculateGrade(mark.marks, subject.maxMarks, subject.passMark, settings.gradingBands);
      if (mark.marks !== null) { total += mark.marks; maximum += subject.maxMarks; }
      if (result.result === "PASS") subjectsPassed += 1;
      if (result.result === "FAIL") subjectsFailed += 1;
    });
    const percentage = maximum ? (total / maximum) * 100 : 0;
    const overallGrade = calculateGrade(total, maximum, maximum * 0.4, settings.gradingBands);
    return { ...student, percentage, result: subjectsFailed > 0 ? "FAIL" : "PASS", grade: overallGrade.grade, subjectsPassed, subjectsFailed };
  }), [students, marks, subjects, settings.gradingBands]);

  const stats = useMemo(() => {
    const average = summaries.length ? summaries.reduce((sum, item) => sum + item.percentage, 0) / summaries.length : 0;
    const passed = summaries.filter(item => item.result === "PASS").length;
    const highest = Math.max(...summaries.map(item => item.percentage), 0);
    return { average, passed, failed: summaries.length - passed, highest, passRate: summaries.length ? passed / summaries.length * 100 : 0 };
  }, [summaries]);

  const grades = useMemo(() => {
    const count: Record<string, number> = {};
    summaries.forEach(summary => { count[summary.grade] = (count[summary.grade] || 0) + 1; });
    return settings.gradingBands.map(band => ({ name: band.label, value: count[band.label] || 0 })).filter(item => item.value > 0);
  }, [summaries, settings.gradingBands]);

  const subjectAverages = useMemo(() => subjects.map(subject => {
    const subjectMarks = marks.filter(mark => mark.subjectId === subject.id && mark.marks !== null);
    const average = subjectMarks.length ? subjectMarks.reduce((sum, mark) => sum + ((mark.marks || 0) / subject.maxMarks * 100), 0) / subjectMarks.length : 0;
    return { name: subject.code, average: Number(average.toFixed(1)), fullName: subject.name };
  }), [subjects, marks]);

  const title = routeTitles[location] || routeTitles["/"];
  const navigate = (path: string) => { setLocation(path); setSidebarOpen(false); };
  const selectedStudent = students.find(student => student.id === selectedStudentId) || null;

  const addStudent = (student: Student) => {
    setStudents(current => [student, ...current]);
    setStudentModal(false);
    toast.success("Student profile added");
  };

  const updateMark = (id: string, value: string) => {
    const next = value === "" ? null : Math.max(0, Number(value));
    setMarks(current => current.map(mark => mark.id === id ? { ...mark, marks: next, updatedAt: new Date().toISOString() } : mark));
  };

  const renderView = () => {
    const common = { students, subjects, marks, summaries, settings, setStudents, setSubjects, setMarks, setSettings, navigate, setSelectedStudentId, setStudentModal, stats, grades, subjectAverages, updateMark, selectedStudent };
    if (location === "/students") return <StudentsView {...common} />;
    if (location === "/subjects") return <SubjectsView {...common} />;
    if (location === "/marks") return <MarksView {...common} />;
    if (location === "/results") return <ResultsView {...common} />;
    if (location === "/reports") return <ReportsView {...common} />;
    if (location === "/analytics") return <AnalyticsView {...common} />;
    if (location === "/settings") return <SettingsView settings={settings} setSettings={setSettings} />;
    if (location === "/users") return <UsersView />;
    return <DashboardView {...common} />;
  };

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><GraduationCap size={22} /></div><div><strong>GradePilot</strong><span>Academic operations</span></div><button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
      <div className="sidebar-profile"><div className="profile-avatar">PS</div><div><strong>Priya Sharma</strong><span>Administrator</span></div><ChevronDown size={14} /></div>
      <nav className="nav-list">{navItems.map((item, index) => <div key={item.path}>{item.section ? <span className="nav-section">{item.section}</span> : null}<button className={`nav-item ${location === item.path ? "active" : ""}`} onClick={() => navigate(item.path)}><item.icon size={17} /><span>{item.label}</span>{item.label === "Results" ? <span className="nav-badge">12</span> : null}</button></div>)}</nav>
      <div className="sidebar-footer"><div className="sync-card"><div className="sync-icon"><Activity size={16} /></div><div><strong>All systems synced</strong><span>Last saved 2 mins ago</span></div><Check size={15} /></div><button className="support-link" onClick={() => toast.message("Support request form is ready for your registrar team.")}><Sparkles size={16} />Need a hand?</button></div>
    </aside>
    {sidebarOpen ? <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" /> : null}
    <main className="workspace">
      <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button><div><span className="eyebrow">{title.eyebrow}</span><h1>{title.title}</h1></div></div><div className="topbar-actions"><div className="topbar-date"><CalendarDays size={15} /> 18 March 2026</div><button className="icon-button" onClick={() => setDark(value => !value)} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><div className="notification-wrap"><button className="icon-button notification-button" onClick={() => setShowNotifications(value => !value)} aria-label="Notifications"><Bell size={18} /><span /></button>{showNotifications ? <div className="notification-popover"><div className="popover-heading"><strong>Notifications</strong><span>2 new</span></div><div className="notice-item"><div className="notice-dot mint" /><div><strong>Marks saved</strong><p>CS401 scores are ready for review.</p><small>12 minutes ago</small></div></div><div className="notice-item"><div className="notice-dot amber" /><div><strong>3 reports need approval</strong><p>Publish before the semester closes.</p><small>1 hour ago</small></div></div></div> : null}</div><div className="topbar-avatar">PS</div></div></header>
      <div className="content"><div className="page-intro"><div><p>{title.description}</p></div><div className="intro-actions">{location === "/" ? <><button className="button button-secondary" onClick={() => navigate("/reports")}><FileText size={16} />Reports</button><button className="button button-primary" onClick={() => setStudentModal(true)}><Plus size={16} />Add student</button></> : null}</div></div>{renderView()}</div>
    </main>
    {studentModal ? <AddStudentModal onClose={() => setStudentModal(false)} onSave={addStudent} /> : null}
    {selectedStudent ? <StudentDrawer student={selectedStudent} summary={summaries.find(item => item.id === selectedStudent.id)!} subjects={subjects} marks={marks} settings={settings} onClose={() => setSelectedStudentId(null)} onPrint={() => window.print()} /> : null}
  </div>;
}

type ViewProps = {
  students: Student[]; subjects: Subject[]; marks: MarkRecord[]; summaries: StudentSummary[]; settings: InstitutionSettings;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>; setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>; setMarks: React.Dispatch<React.SetStateAction<MarkRecord[]>>; setSettings: React.Dispatch<React.SetStateAction<InstitutionSettings>>;
  navigate: (path: string) => void; setSelectedStudentId: (id: string | null) => void; setStudentModal: (value: boolean) => void; stats: { average: number; passed: number; failed: number; highest: number; passRate: number }; grades: { name: string; value: number }[]; subjectAverages: { name: string; average: number; fullName: string }[]; updateMark: (id: string, value: string) => void; selectedStudent: Student | null;
};

function DashboardView({ students, subjects, summaries, stats, grades, subjectAverages, navigate, setSelectedStudentId }: ViewProps) {
  const topStudents = [...summaries].sort((a, b) => b.percentage - a.percentage).slice(0, 5);
  const pieTotal = grades.reduce((sum, item) => sum + item.value, 0) || 1;
  return <div className="dashboard-view">
    <div className="metric-grid"><MetricCard icon={Users} label="Total students" value={String(students.length)} detail="4 added this term" tone="blue" trend="12.5%" /><MetricCard icon={BookOpen} label="Active subjects" value={String(subjects.length)} detail="Across 3 departments" tone="purple" /><MetricCard icon={CheckCircle2} label="Pass percentage" value={formatPercent(stats.passRate)} detail={`${stats.passed} students passed`} tone="mint" trend="4.8%" /><MetricCard icon={Award} label="Class average" value={formatPercent(stats.average)} detail={`Highest ${formatPercent(stats.highest)}`} tone="amber" trend="2.1%" /></div>
    <div className="hero-strip"><div className="hero-copy"><span className="eyebrow mint-eyebrow">SEMESTER 4 · 2025–26</span><h2>Results are moving in the right direction.</h2><p>Across {subjects.length} subjects, your class average is <strong>{formatPercent(stats.average)}</strong> — up 2.1% from the last assessment.</p><button className="text-button" onClick={() => navigate("/analytics")}>View performance analytics <ArrowUpRight size={15} /></button></div><div className="hero-visual"><div className="ring-chart" style={{ "--progress": `${stats.passRate}%` } as React.CSSProperties}><div><strong>{Math.round(stats.passRate)}%</strong><span>passed</span></div></div><div className="hero-legend"><span><i className="dot dot-mint" />On track <strong>{stats.passed}</strong></span><span><i className="dot dot-coral" />Needs review <strong>{stats.failed}</strong></span></div></div></div>
    <div className="dashboard-columns"><div className="surface chart-surface"><SectionHeader title="Subject performance" action={<button className="button button-ghost" onClick={() => navigate("/analytics")}>Full analytics <ArrowUpRight size={14} /></button>}><span>Average marks by subject · End Semester Examination</span></SectionHeader><div className="chart-container"><SimpleBarChart data={subjectAverages} /></div><div className="chart-footer"><span><i className="dot dot-blue" />Class average</span><span>Updated 18 Mar 2026</span></div></div><div className="surface grade-surface"><SectionHeader title="Grade distribution" action={<button className="icon-button"><MoreHorizontal size={17} /></button>}><span>Current cohort</span></SectionHeader><div className="donut-row"><div className="donut-chart" style={{ background: `conic-gradient(${palette.slice(0, grades.length).map((color, index) => `${color} 0 ${grades.slice(0, index + 1).reduce((sum, item) => sum + item.value, 0) / pieTotal * 360}deg`).join(", ")})` }}><div className="donut-hole"><strong>{students.length}</strong><span>students</span></div></div><div className="grade-list">{grades.slice(0, 5).map((grade, index) => <div key={grade.name}><span><i className="dot" style={{ background: palette[index] }} />Grade {grade.name}</span><strong>{grade.value}</strong></div>)}</div></div><div className="surface-note"><TrendingUp size={15} /><span>Most students are sitting in the <strong>A band</strong> this semester.</span></div></div></div>
    <div className="dashboard-columns bottom-columns"><div className="surface table-surface"><SectionHeader title="Top performers" action={<button className="button button-ghost" onClick={() => navigate("/results")}>View all <ArrowUpRight size={14} /></button>}><span>Students leading the cohort</span></SectionHeader><div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Department</th><th>Average</th><th>Result</th><th /></tr></thead><tbody>{topStudents.map(student => <tr key={student.id}><td><div className="student-cell"><Avatar student={student} /><div><strong>{student.name}</strong><span>{student.rollNo}</span></div></div></td><td>{student.department.replace("Computer Science", "Computer Sci.")}</td><td><strong>{formatPercent(student.percentage)}</strong></td><td><StatusPill tone="positive">{student.result}</StatusPill></td><td><button className="icon-button table-more" onClick={() => setSelectedStudentId(student.id)}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div></div><div className="surface activity-surface"><SectionHeader title="Recent activity" action={<button className="icon-button"><MoreHorizontal size={17} /></button>}><span>Latest updates across your workspace</span></SectionHeader><div className="activity-list"><ActivityItem icon={CheckCircle2} tone="mint" title="Marks saved" detail="CS401 · End Semester Examination" time="12 min ago" /><ActivityItem icon={FileText} tone="blue" title="Report generated" detail="Ananya Rao · Semester 4" time="34 min ago" /><ActivityItem icon={UserRound} tone="purple" title="New student added" detail="Neel Iyer · CS24010" time="2 hrs ago" /><ActivityItem icon={AlertCircle} tone="amber" title="Review required" detail="3 reports waiting for approval" time="Yesterday" /></div></div></div>
  </div>;
}

function SimpleBarChart({ data }: { data: { name: string; average: number }[] }) {
  return <div className="bar-chart">{data.map(item => <div className="bar-column" key={item.name}><div className="bar-value">{item.average}</div><div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(8, item.average)}%` }} /></div><span>{item.name}</span></div>)}</div>;
}

function ActivityItem({ icon: Icon, tone, title, detail, time }: { icon: typeof CheckCircle2; tone: string; title: string; detail: string; time: string }) {
  return <div className="activity-item"><div className={`activity-icon activity-${tone}`}><Icon size={15} /></div><div><strong>{title}</strong><span>{detail}</span></div><small>{time}</small></div>;
}

function StudentsView({ students, summaries, setStudents, setStudentModal, setSelectedStudentId }: ViewProps) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All departments");
  const filtered = summaries.filter(student => `${student.name} ${student.rollNo} ${student.registerNo}`.toLowerCase().includes(query.toLowerCase()) && (department === "All departments" || student.department === department));
  const remove = (id: string) => { if (window.confirm("Delete this student profile? This cannot be undone.")) { setStudents(current => current.filter(student => student.id !== id)); toast.success("Student profile deleted"); } };
  return <div className="view-stack"><div className="surface toolbar-surface"><div className="search-box"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name, roll number, or register number" /></div><div className="toolbar-actions"><select value={department} onChange={event => setDepartment(event.target.value)}><option>All departments</option>{departments.map(item => <option key={item}>{item}</option>)}</select><button className="button button-secondary" onClick={() => downloadCsv("students.csv", filtered.map(student => ({ name: student.name, rollNumber: student.rollNo, registerNumber: student.registerNo, department: student.department, semester: student.semester, percentage: formatPercent(student.percentage) })))}><Download size={15} />Export CSV</button><button className="button button-primary" onClick={() => setStudentModal(true)}><Plus size={16} />Add student</button></div></div><div className="surface table-surface"><SectionHeader title={`${filtered.length} student profiles`} action={<button className="button button-ghost"><SlidersHorizontal size={15} />Customize columns</button>}><span>Every profile is connected to a current academic record.</span></SectionHeader><div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Registration</th><th>Department</th><th>Semester</th><th>Performance</th><th>Status</th><th /></tr></thead><tbody>{filtered.map(student => <tr key={student.id}><td><div className="student-cell"><Avatar student={student} /><div><button className="link-button" onClick={() => setSelectedStudentId(student.id)}>{student.name}</button><span>{student.email}</span></div></div></td><td><strong>{student.rollNo}</strong><span className="cell-subtext">{student.registerNo}</span></td><td>{student.department}</td><td>Semester {student.semester}</td><td><div className="performance-cell"><strong>{formatPercent(student.percentage)}</strong><div className="mini-progress"><span style={{ width: `${student.percentage}%` }} /></div></div></td><td><StatusPill tone={student.result === "PASS" ? "positive" : "danger"}>{student.result}</StatusPill></td><td><div className="row-actions"><button className="icon-button" onClick={() => setSelectedStudentId(student.id)}><Pencil size={15} /></button><button className="icon-button danger-button" onClick={() => remove(student.id)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>{filtered.length === 0 ? <EmptyState icon={Search} title="No students found" description="Try a different search term or department filter." /> : null}</div></div>;
}

function SubjectsView({ subjects, setSubjects }: ViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState({ code: "", name: "", department: departments[0], semester: 4, maxMarks: 100, passMark: 40, credits: 3 });
  const add = () => { if (!newSubject.code || !newSubject.name) return toast.error("Add a subject code and name"); setSubjects(current => [...current, { ...newSubject, id: `sub-${Date.now()}` }]); setNewSubject({ ...newSubject, code: "", name: "" }); setShowAdd(false); toast.success("Subject added"); };
  return <div className="view-stack"><div className="summary-strip"><div><span className="eyebrow">Curriculum health</span><strong>{subjects.length} active subjects</strong><p>Assessment structure is configured for Semester 4.</p></div><div className="summary-stat"><span>Average credits</span><strong>{(subjects.reduce((sum, item) => sum + item.credits, 0) / subjects.length).toFixed(1)}</strong></div><div className="summary-stat"><span>Passing mark</span><strong>40 / 100</strong></div><button className="button button-primary" onClick={() => setShowAdd(value => !value)}><Plus size={16} />Add subject</button></div>{showAdd ? <div className="surface inline-form"><div className="form-grid"><label>Code<input value={newSubject.code} onChange={event => setNewSubject({ ...newSubject, code: event.target.value.toUpperCase() })} placeholder="CS406" /></label><label>Subject name<input value={newSubject.name} onChange={event => setNewSubject({ ...newSubject, name: event.target.value })} placeholder="Software Testing" /></label><label>Department<select value={newSubject.department} onChange={event => setNewSubject({ ...newSubject, department: event.target.value })}>{departments.map(item => <option key={item}>{item}</option>)}</select></label><label>Credits<input type="number" value={newSubject.credits} onChange={event => setNewSubject({ ...newSubject, credits: Number(event.target.value) })} /></label></div><div className="form-actions"><button className="button button-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="button button-primary" onClick={add}>Save subject</button></div></div> : null}<div className="subject-grid">{subjects.map(subject => <div className="surface subject-card" key={subject.id}><div className="subject-card-top"><span className="subject-code">{subject.code}</span><button className="icon-button"><MoreHorizontal size={17} /></button></div><h3>{subject.name}</h3><p>{subject.department} · Semester {subject.semester}</p><div className="subject-card-meta"><span><strong>{subject.credits}</strong> credits</span><span><strong>{subject.maxMarks}</strong> max marks</span><span><strong>{subject.passMark}</strong> to pass</span></div><div className="subject-progress"><div><span>Class average</span><strong>78.4%</strong></div><div className="mini-progress"><span style={{ width: "78%" }} /></div></div></div>)}</div></div>;
}

function MarksView({ students, subjects, marks, updateMark }: ViewProps) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [exam, setExam] = useState(examinations[0]);
  const [query, setQuery] = useState("");
  const subject = subjects.find(item => item.id === subjectId) || subjects[0];
  const rows = students.filter(student => student.name.toLowerCase().includes(query.toLowerCase()) || student.rollNo.toLowerCase().includes(query.toLowerCase())).map(student => ({ student, mark: marks.find(item => item.studentId === student.id && item.subjectId === subject?.id && item.examination === exam) }));
  const save = () => toast.success(`${subject?.code} marks saved for ${rows.length} students`);
  return <div className="view-stack"><div className="surface assessment-banner"><div className="assessment-title"><div className="assessment-icon"><ClipboardCheck size={19} /></div><div><span className="eyebrow mint-eyebrow">MARKS ENTRY · DRAFT</span><h2>Enter assessment scores</h2><p>Validated automatically against the configured maximum and pass marks.</p></div></div><div className="assessment-meta"><span><small>Academic year</small><strong>2025–26</strong></span><span><small>Semester</small><strong>4</strong></span><span><small>Students</small><strong>{students.length}</strong></span></div></div><div className="surface toolbar-surface"><div className="filter-group"><label>Examination<select value={exam} onChange={event => setExam(event.target.value)}>{examinations.map(item => <option key={item}>{item}</option>)}</select></label><label>Subject<select value={subjectId} onChange={event => setSubjectId(event.target.value)}>{subjects.map(item => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label></div><div className="toolbar-actions"><div className="search-box compact"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search students" /></div><button className="button button-secondary" onClick={() => downloadCsv(`${subject?.code || "marks"}-marks.csv`, rows.map(({ student, mark }) => ({ student: student.name, rollNumber: student.rollNo, subject: subject?.code || "", examination: exam, marks: mark?.marks ?? "ABS" })))}><Download size={15} />Export</button><button className="button button-primary" onClick={save}><Check size={16} />Save marks</button></div></div><div className="surface table-surface"><SectionHeader title={`${subject?.code} · ${subject?.name}`} action={<div className="inline-note"><span className="dot dot-mint" />Autosave is on</div>}><span>Maximum marks {subject?.maxMarks} · Passing marks {subject?.passMark}</span></SectionHeader><div className="table-wrap"><table className="data-table marks-table"><thead><tr><th>#</th><th>Student</th><th>Roll number</th><th>Marks obtained</th><th>Percentage</th><th>Grade</th><th>Result</th></tr></thead><tbody>{rows.map(({ student, mark }, index) => { const grade = subject && mark ? calculateGrade(mark.marks, subject.maxMarks, subject.passMark) : null; return <tr key={student.id}><td className="muted-cell">{String(index + 1).padStart(2, "0")}</td><td><div className="student-cell"><Avatar student={student} size="sm" /><strong>{student.name}</strong></div></td><td>{student.rollNo}</td><td><div className="mark-input-wrap"><input type="number" min="0" max={subject?.maxMarks} value={mark?.marks ?? ""} placeholder="ABS" onChange={event => mark && updateMark(mark.id, event.target.value)} /><span>/ {subject?.maxMarks}</span></div></td><td>{grade?.result === "ABS" ? "—" : formatPercent(grade?.percentage || 0)}</td><td><strong className={grade?.grade === "U" ? "text-danger" : ""}>{grade?.grade || "—"}</strong></td><td>{grade ? <StatusPill tone={grade.result === "PASS" ? "positive" : grade.result === "FAIL" ? "danger" : "warning"}>{grade.result}</StatusPill> : <span className="muted-cell">Not entered</span>}</td></tr>; })}</tbody></table></div></div></div>;
}

function ResultsView({ summaries, setSelectedStudentId, navigate }: ViewProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("All results");
  const filtered = summaries.filter(student => `${student.name} ${student.rollNo} ${student.registerNo}`.toLowerCase().includes(query.toLowerCase()) && (result === "All results" || student.result === result));
  return <div className="view-stack"><div className="surface toolbar-surface"><div className="search-box"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by roll number or register number" /></div><div className="toolbar-actions"><select value={result} onChange={event => setResult(event.target.value)}><option>All results</option><option>PASS</option><option>FAIL</option></select><button className="button button-secondary" onClick={() => downloadCsv("semester-4-results.csv", filtered.map(student => ({ student: student.name, rollNumber: student.rollNo, department: student.department, percentage: formatPercent(student.percentage), result: student.result })))}><Download size={15} />Export results</button><button className="button button-primary" onClick={() => navigate("/reports")}><FileText size={16} />Generate reports</button></div></div><div className="results-highlight"><div><span className="eyebrow mint-eyebrow">SEMESTER 4 RESULT SNAPSHOT</span><h2>{formatPercent(filtered.reduce((sum, item) => sum + item.percentage, 0) / (filtered.length || 1))} average across visible students</h2><p>Results are calculated from saved marks and the active institutional grading rules.</p></div><div className="result-stats"><span><strong>{filtered.filter(item => item.result === "PASS").length}</strong> passed</span><span><strong>{filtered.filter(item => item.result === "FAIL").length}</strong> need review</span></div></div><div className="surface table-surface"><SectionHeader title="Published results" action={<button className="button button-ghost"><Filter size={15} />More filters</button>}><span>{filtered.length} records · End Semester Examination</span></SectionHeader><div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Department</th><th>Subjects passed</th><th>Overall percentage</th><th>Grade</th><th>Result</th><th /></tr></thead><tbody>{filtered.sort((a, b) => b.percentage - a.percentage).map(student => <tr key={student.id}><td><div className="student-cell"><Avatar student={student} /><div><button className="link-button" onClick={() => setSelectedStudentId(student.id)}>{student.name}</button><span>{student.rollNo}</span></div></div></td><td>{student.department}</td><td>{student.subjectsPassed} / 5</td><td><div className="performance-cell"><strong>{formatPercent(student.percentage)}</strong><div className="mini-progress"><span style={{ width: `${student.percentage}%` }} /></div></div></td><td><strong>{student.grade}</strong></td><td><StatusPill tone={student.result === "PASS" ? "positive" : "danger"}>{student.result}</StatusPill></td><td><button className="button button-ghost small-button" onClick={() => setSelectedStudentId(student.id)}>View report <ArrowUpRight size={13} /></button></td></tr>)}</tbody></table></div></div></div>;
}

function ReportsView({ summaries, setSelectedStudentId, navigate, students }: ViewProps) {
  const reportTypes = [{ icon: UserRound, title: "Individual report card", detail: "A complete printable report for one student", action: "Open results", path: "/results" }, { icon: Users, title: "Class grade sheet", detail: "Consolidated marks and grades for the cohort", action: "Generate sheet" }, { icon: BookOpen, title: "Subject performance", detail: "Compare subject averages and pass percentages", action: "View analytics", path: "/analytics" }, { icon: FileBarChart, title: "Department report", detail: "Semester-level report for department review", action: "Generate report" }, { icon: CalendarDays, title: "Semester summary", detail: "An official snapshot of the current semester", action: "Generate summary" }, { icon: Printer, title: "Print center", detail: "Print-ready exports for registrar approval", action: "Open print center" }];
  return <div className="view-stack"><div className="surface report-intro"><div className="report-intro-icon"><FileText size={23} /></div><div><span className="eyebrow mint-eyebrow">REPORT CENTER</span><h2>Make every result presentation-ready.</h2><p>Choose a report format below. All exports use the live saved records and current institution settings.</p></div><button className="button button-primary" onClick={() => window.print()}><Printer size={16} />Print current view</button></div><div className="report-grid">{reportTypes.map(report => <div className="surface report-card" key={report.title}><div className="report-card-icon"><report.icon size={19} /></div><h3>{report.title}</h3><p>{report.detail}</p><button className="text-button" onClick={() => { if (report.path) navigate(report.path); else { downloadCsv(`${report.title.toLowerCase().replaceAll(" ", "-")}.csv`, summaries.map(student => ({ student: student.name, rollNumber: student.rollNo, percentage: formatPercent(student.percentage), result: student.result }))); } }}>{report.action} <ArrowUpRight size={14} /></button></div>)}</div><div className="surface table-surface"><SectionHeader title="Recently generated" action={<StatusPill tone="positive">All systems synced</StatusPill>}><span>Ready to download again</span></SectionHeader><div className="generated-list"><GeneratedReport title="Semester 4 · Class grade sheet" meta={`${students.length} students · Generated today at 10:42 AM`} /><GeneratedReport title="Ananya Rao · Individual report" meta="REG2024001 · Generated today at 10:18 AM" /><GeneratedReport title="Computer Science · Department report" meta="Semester 4 · Generated yesterday" /></div></div></div>;
}

function GeneratedReport({ title, meta }: { title: string; meta: string }) { return <div className="generated-row"><div className="generated-icon"><FileText size={17} /></div><div><strong>{title}</strong><span>{meta}</span></div><StatusPill tone="positive">Published</StatusPill><button className="icon-button" onClick={() => toast.success("Report download started")}><ArrowDownToLine size={16} /></button></div>; }

function AnalyticsView({ stats, grades, subjectAverages, summaries, navigate }: ViewProps) {
  const supportCount = summaries.filter(item => item.percentage < 60).length;
  return <div className="view-stack"><div className="analytics-top"><div className="surface analytics-primary"><span className="eyebrow mint-eyebrow">COHORT HEALTH</span><h2>{formatPercent(stats.average)} <span>average</span></h2><p>Overall percentage is up 2.1% compared with the previous internal assessment.</p><div className="analytics-ruler"><span style={{ width: `${stats.average}%` }} /></div><div className="ruler-labels"><span>0%</span><span>Class average</span><span>100%</span></div></div><div className="surface analytics-side"><span className="eyebrow">SUPPORT QUEUE</span><strong>{supportCount} {supportCount === 1 ? "student" : "students"}</strong><p>could benefit from an academic support plan.</p><button className="text-button" onClick={() => navigate("/results")}>Review students <ArrowUpRight size={14} /></button></div></div><div className="analytics-grid"><div className="surface chart-surface"><SectionHeader title="Subject averages"><span>Average percentage across the current cohort</span></SectionHeader><div className="analytics-bars">{subjectAverages.map(item => <div className="analytics-bar-row" key={item.name}><div><strong>{item.name}</strong><span>{item.fullName}</span></div><div className="analytics-track"><span style={{ width: `${item.average}%` }} /></div><strong>{item.average}</strong></div>)}</div></div><div className="surface grade-surface"><SectionHeader title="Grade distribution"><span>Students by current grade</span></SectionHeader><div className="grade-distribution">{grades.map((item, index) => <div key={item.name}><span className="grade-label"><i className="dot" style={{ background: palette[index] }} />{item.name}</span><div className="grade-track"><span style={{ width: `${item.value / summaries.length * 100}%`, background: palette[index] }} /></div><strong>{item.value}</strong></div>)}</div></div></div></div>;
}

function SettingsView({ settings, setSettings }: { settings: InstitutionSettings; setSettings: React.Dispatch<React.SetStateAction<InstitutionSettings>> }) {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); toast.success("Institution settings saved"); setTimeout(() => setSaved(false), 2500); };
  return <div className="view-stack"><div className="settings-layout"><div className="settings-nav surface"><span className="eyebrow">SETTINGS</span><button className="settings-tab active"><Settings size={15} />Institution profile</button><button className="settings-tab"><Award size={15} />Grading rules</button><button className="settings-tab"><ClipboardCheck size={15} />Assessments</button><button className="settings-tab"><FileText size={15} />Report appearance</button></div><div className="settings-content"><div className="surface settings-panel"><SectionHeader title="Institution profile"><span>These details appear on every report card.</span></SectionHeader><div className="settings-form"><label>Institution name<input value={settings.institutionName} onChange={event => setSettings({ ...settings, institutionName: event.target.value })} /></label><label>Academic year<input value={settings.academicYear} onChange={event => setSettings({ ...settings, academicYear: event.target.value })} /></label><label className="full-label">Report footer<textarea value={settings.reportFooter} onChange={event => setSettings({ ...settings, reportFooter: event.target.value })} /></label></div></div><div className="surface settings-panel"><SectionHeader title="Default grading scale" action={<StatusPill tone="positive">Active</StatusPill>}><span>Applied to new calculations and reports.</span></SectionHeader><div className="grading-table"><div className="grading-head"><span>Minimum percentage</span><span>Grade</span><span>Grade point</span></div>{settings.gradingBands.map((band, index) => <div className="grading-row" key={`${band.label}-${index}`}><input type="number" value={band.min} onChange={event => { const next = [...settings.gradingBands]; next[index] = { ...band, min: Number(event.target.value) }; setSettings({ ...settings, gradingBands: next }); }} /><span className="grade-chip">{band.label}</span><input type="number" value={band.point} onChange={event => { const next = [...settings.gradingBands]; next[index] = { ...band, point: Number(event.target.value) }; setSettings({ ...settings, gradingBands: next }); }} /></div>)}</div><div className="settings-callout"><AlertCircle size={16} /><span>Changing the grading scale affects future calculations. Published official results are not overwritten.</span></div></div><div className="settings-actions"><span>{saved ? <><Check size={14} />Saved just now</> : "Changes are saved to this workspace."}</span><button className="button button-primary" onClick={save}>Save settings</button></div></div></div></div>;
}

function UsersView() {
  const users = [{ initials: "PS", name: "Priya Sharma", email: "priya.sharma@northstar.edu", role: "Administrator", status: "Active", color: "#2dd4bf" }, { initials: "AM", name: "Aarav Menon", email: "aarav.menon@northstar.edu", role: "Teacher", status: "Active", color: "#8b5cf6" }, { initials: "RK", name: "Ritika Kapoor", email: "ritika.kapoor@northstar.edu", role: "Teacher", status: "Active", color: "#f59e0b" }, { initials: "ST", name: "Student portal", email: "student.access@northstar.edu", role: "Student", status: "Restricted", color: "#38bdf8" }];
  return <div className="view-stack"><div className="role-strip"><div><span className="eyebrow mint-eyebrow">ACCESS MODEL</span><h2>Private by default.</h2><p>Backend permissions keep student information visible only to the people who need it.</p></div><ShieldCheck size={42} /></div><div className="surface table-surface"><SectionHeader title="Workspace users" action={<button className="button button-primary" onClick={() => toast.success("Invite flow opened") }><Plus size={16} />Invite user</button>}><span>4 accounts · Role-based access enabled</span></SectionHeader><div className="table-wrap"><table className="data-table"><thead><tr><th>User</th><th>Role</th><th>Access</th><th>Last active</th><th /></tr></thead><tbody>{users.map(user => <tr key={user.email}><td><div className="student-cell"><span className="avatar avatar-md" style={{ background: `${user.color}22`, color: user.color }}>{user.initials}</span><div><strong>{user.name}</strong><span>{user.email}</span></div></div></td><td><span className="role-chip">{user.role}</span></td><td><StatusPill tone={user.status === "Active" ? "positive" : "warning"}>{user.status}</StatusPill></td><td>Today, 10:42 AM</td><td><button className="icon-button"><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div></div></div>;
}

function AddStudentModal({ onClose, onSave }: { onClose: () => void; onSave: (student: Student) => void }) {
  const [form, setForm] = useState({ name: "", rollNo: "", registerNo: "", department: departments[0], course: "B.Tech Computer Science", semester: 4, email: "" });
  const save = () => { if (!form.name || !form.rollNo || !form.registerNo || !form.email) return toast.error("Complete the required student fields"); onSave({ ...form, id: `s-${Date.now()}`, academicYear: "2025–26", color: palette[Math.floor(Math.random() * palette.length)] }); };
  return <div className="modal-backdrop"><div className="modal"><div className="modal-heading"><div><span className="eyebrow mint-eyebrow">NEW PROFILE</span><h2>Add a student</h2><p>Start with the details used on their academic record.</p></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="form-grid"><label className="full-label">Full name<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Student name" /></label><label>Roll number<input value={form.rollNo} onChange={event => setForm({ ...form, rollNo: event.target.value.toUpperCase() })} placeholder="CS24011" /></label><label>Register number<input value={form.registerNo} onChange={event => setForm({ ...form, registerNo: event.target.value.toUpperCase() })} placeholder="REG2024011" /></label><label>Department<select value={form.department} onChange={event => setForm({ ...form, department: event.target.value })}>{departments.map(item => <option key={item}>{item}</option>)}</select></label><label>Semester<select value={form.semester} onChange={event => setForm({ ...form, semester: Number(event.target.value) })}>{[1, 2, 3, 4, 5, 6, 7, 8].map(item => <option key={item} value={item}>{item}</option>)}</select></label><label className="full-label">Email address<input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="student@northstar.edu" /></label></div><div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" onClick={save}><Plus size={16} />Create profile</button></div></div></div>;
}

function StudentDrawer({ student, summary, subjects, marks, settings, onClose, onPrint }: { student: Student; summary: StudentSummary; subjects: Subject[]; marks: MarkRecord[]; settings: InstitutionSettings; onClose: () => void; onPrint: () => void }) {
  return <div className="drawer-backdrop" onClick={onClose}><aside className="student-drawer" onClick={event => event.stopPropagation()}><div className="drawer-heading"><button className="icon-button" onClick={onClose}><X size={18} /></button><div className="drawer-actions"><button className="icon-button" onClick={onPrint}><Printer size={17} /></button><button className="button button-primary small-button" onClick={() => toast.success("PDF report download started")}><Download size={14} />Download PDF</button></div></div><div className="drawer-profile"><Avatar student={student} size="lg" /><span className="eyebrow mint-eyebrow">STUDENT REPORT CARD</span><h2>{student.name}</h2><p>{student.rollNo} · {student.department}</p><StatusPill tone={summary.result === "PASS" ? "positive" : "danger"}>{summary.result}</StatusPill></div><div className="drawer-score"><div><span>Overall percentage</span><strong>{formatPercent(summary.percentage)}</strong></div><div><span>Grade</span><strong>{summary.grade}</strong></div><div><span>Subjects passed</span><strong>{summary.subjectsPassed} / {subjects.length}</strong></div></div><div className="drawer-section"><SectionHeader title="Subject breakdown"><span>End Semester Examination</span></SectionHeader><div className="drawer-subjects">{subjects.map(subject => { const mark = marks.find(item => item.studentId === student.id && item.subjectId === subject.id); const grade = calculateGrade(mark?.marks ?? null, subject.maxMarks, subject.passMark, settings.gradingBands); return <div className="drawer-subject" key={subject.id}><div><strong>{subject.code}</strong><span>{subject.name}</span></div><div><strong>{mark?.marks ?? "ABS"} / {subject.maxMarks}</strong><StatusPill tone={grade.result === "PASS" ? "positive" : grade.result === "FAIL" ? "danger" : "warning"}>{grade.grade}</StatusPill></div></div>; })}</div></div><div className="drawer-footer"><span>Report generated 18 Mar 2026</span><button className="text-button" onClick={() => toast.message("Official publication is available to administrators.")}>Publish report <ArrowUpRight size={14} /></button></div></aside></div>;
}
