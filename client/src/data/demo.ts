import { DEFAULT_GRADE_BANDS, type GradeBand } from "@/lib/grade";

export type Student = {
  id: string;
  name: string;
  rollNo: string;
  registerNo: string;
  department: string;
  course: string;
  semester: number;
  academicYear: string;
  email: string;
  color: string;
};

export type Subject = {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  maxMarks: number;
  passMark: number;
  credits: number;
};

export type MarkRecord = {
  id: string;
  studentId: string;
  subjectId: string;
  examination: string;
  marks: number | null;
  updatedAt: string;
};

export type InstitutionSettings = {
  institutionName: string;
  academicYear: string;
  gradingBands: GradeBand[];
  defaultPassMark: number;
  examinationTypes: string[];
  reportFooter: string;
};

export const departments = ["Computer Science", "Information Technology", "Electronics"];
export const examinations = ["End Semester Examination", "Internal Assessment", "Practical Examination"];

export const initialStudents: Student[] = [
  { id: "s-01", name: "Ananya Rao", rollNo: "CS24001", registerNo: "REG2024001", department: "Computer Science", course: "B.Tech Computer Science", semester: 4, academicYear: "2025–26", email: "ananya.rao@northstar.edu", color: "#2dd4bf" },
  { id: "s-02", name: "Rohan Mehta", rollNo: "CS24002", registerNo: "REG2024002", department: "Computer Science", course: "B.Tech Computer Science", semester: 4, academicYear: "2025–26", email: "rohan.mehta@northstar.edu", color: "#8b5cf6" },
  { id: "s-03", name: "Kavya Nair", rollNo: "CS24003", registerNo: "REG2024003", department: "Computer Science", course: "B.Tech Computer Science", semester: 4, academicYear: "2025–26", email: "kavya.nair@northstar.edu", color: "#f59e0b" },
  { id: "s-04", name: "Ishaan Verma", rollNo: "IT24004", registerNo: "REG2024004", department: "Information Technology", course: "B.Tech Information Technology", semester: 4, academicYear: "2025–26", email: "ishaan.verma@northstar.edu", color: "#38bdf8" },
  { id: "s-05", name: "Meera Shah", rollNo: "IT24005", registerNo: "REG2024005", department: "Information Technology", course: "B.Tech Information Technology", semester: 4, academicYear: "2025–26", email: "meera.shah@northstar.edu", color: "#fb7185" },
  { id: "s-06", name: "Arjun Kapoor", rollNo: "EC24006", registerNo: "REG2024006", department: "Electronics", course: "B.Tech Electronics", semester: 4, academicYear: "2025–26", email: "arjun.kapoor@northstar.edu", color: "#22c55e" },
  { id: "s-07", name: "Diya Thomas", rollNo: "CS24007", registerNo: "REG2024007", department: "Computer Science", course: "B.Tech Computer Science", semester: 4, academicYear: "2025–26", email: "diya.thomas@northstar.edu", color: "#f97316" },
  { id: "s-08", name: "Aditya Bose", rollNo: "IT24008", registerNo: "REG2024008", department: "Information Technology", course: "B.Tech Information Technology", semester: 4, academicYear: "2025–26", email: "aditya.bose@northstar.edu", color: "#0ea5e9" },
  { id: "s-09", name: "Sara Joseph", rollNo: "EC24009", registerNo: "REG2024009", department: "Electronics", course: "B.Tech Electronics", semester: 4, academicYear: "2025–26", email: "sara.joseph@northstar.edu", color: "#e879f9" },
  { id: "s-10", name: "Neel Iyer", rollNo: "CS24010", registerNo: "REG2024010", department: "Computer Science", course: "B.Tech Computer Science", semester: 4, academicYear: "2025–26", email: "neel.iyer@northstar.edu", color: "#14b8a6" },
];

export const initialSubjects: Subject[] = [
  { id: "sub-01", code: "CS401", name: "Data Structures & Algorithms", department: "Computer Science", semester: 4, maxMarks: 100, passMark: 40, credits: 4 },
  { id: "sub-02", code: "CS402", name: "Database Management Systems", department: "Computer Science", semester: 4, maxMarks: 100, passMark: 40, credits: 4 },
  { id: "sub-03", code: "CS403", name: "Operating Systems", department: "Computer Science", semester: 4, maxMarks: 100, passMark: 40, credits: 3 },
  { id: "sub-04", code: "CS404", name: "Computer Networks", department: "Computer Science", semester: 4, maxMarks: 100, passMark: 40, credits: 3 },
  { id: "sub-05", code: "CS405", name: "Web Engineering Lab", department: "Computer Science", semester: 4, maxMarks: 50, passMark: 20, credits: 2 },
];

const scores = [86, 78, 91, 68, 74, 88, 36, 82, 94, 72];
const subjectOffsets = [0, -4, 3, -8, 2];
export const initialMarks: MarkRecord[] = initialStudents.flatMap((student, studentIndex) => initialSubjects.map((subject, subjectIndex) => ({
  id: `m-${studentIndex + 1}-${subjectIndex + 1}`,
  studentId: student.id,
  subjectId: subject.id,
  examination: "End Semester Examination",
  marks: Math.max(0, Math.min(subject.maxMarks, subject.maxMarks <= 50
    ? Math.round((scores[studentIndex] + subjectOffsets[subjectIndex]) / 2)
    : scores[studentIndex] + subjectOffsets[subjectIndex])),
  updatedAt: "2026-03-18T10:30:00.000Z",
})));

export const defaultSettings: InstitutionSettings = {
  institutionName: "Northstar Institute of Technology",
  academicYear: "2025–26",
  gradingBands: DEFAULT_GRADE_BANDS,
  defaultPassMark: 40,
  examinationTypes: examinations,
  reportFooter: "Generated by the Academic Operations Office · Verify against the signed ledger before publishing.",
};
