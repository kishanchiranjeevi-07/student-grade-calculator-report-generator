export type GradeBand = {
  min: number;
  label: string;
  point: number;
};

export const DEFAULT_GRADE_BANDS: GradeBand[] = [
  { min: 90, label: "O", point: 10 },
  { min: 80, label: "A+", point: 9 },
  { min: 70, label: "A", point: 8 },
  { min: 60, label: "B+", point: 7 },
  { min: 50, label: "B", point: 6 },
  { min: 40, label: "C", point: 5 },
  { min: 0, label: "U", point: 0 },
];

export type GradeResult = {
  percentage: number;
  grade: string;
  point: number;
  result: "PASS" | "FAIL" | "ABS";
};

export function calculateGrade(marks: number | null, maxMarks: number, passMark: number, bands = DEFAULT_GRADE_BANDS): GradeResult {
  if (marks === null || Number.isNaN(marks)) {
    return { percentage: 0, grade: "ABS", point: 0, result: "ABS" };
  }
  const percentage = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
  const band = [...bands].sort((a, b) => b.min - a.min).find(item => percentage >= item.min) ?? bands[bands.length - 1];
  const result = marks >= passMark ? "PASS" : "FAIL";
  return { percentage, grade: band.label, point: band.point, result };
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function initials(name: string) {
  return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
}
