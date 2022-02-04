export const yearOptions: Option<number>[] = [
  { label: "전체", value: 0 },
  { label: "2022", value: 2022 },
];

export const semesterOptions: Option<Semester | "">[] = [
  { label: "전체", value: "" },
  { label: "1학기", value: "SPRING" },
  { label: "2학기", value: "FALL" },
  { label: "여름학기", value: "SUMMER" },
  { label: "겨울학기", value: "WINTER" },
];
