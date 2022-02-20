interface Option<V = string | number> {
  label: string;
  value: V;
}

type AssignmentType = "TRANSLATION" | "SIMULTANEOUS" | "SEQUENTIAL";
type Semester = "SPRING" | "SUMMER" | "FALL" | "WINTER";
type Role = "PROFESSOR" | "ASSISTANT" | "STUDENT";

interface Region {
  start: number;
  end: number;
}

interface College {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  college: College;
}
interface CreateDepartmentDto {
  name: string;
  collegeName: string;
}
type UpdateDepartmentDto = Partial<CreateDepartmentDto>;

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  college: string;
  role: Role;
  isAdmin: boolean;
}
interface CreateUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}
type UpdateUserDto = Omit<CreateUserDto, "id">;

interface Course {
  id: number;
  year: number;
  semester: Semester;
  department: Department & { college: College };
  code: string;
  name: string;
}
interface CreateCourseDto {
  year: number;
  semester: Semester;
  departmentId: number;
  code: string;
  name: string;
}
type UpdateCourseDto = Partial<CreateCourseDto>;

interface Class {
  id: number;
  course: Course;
  classNumber: number;
}
interface CreateClassDto {
  courseId: number;
  classNumber: number;
  studentIds: string[];
  professorIds: string[];
}
type UpdateClassDto = Partial<CreateClassDto>;

interface Assignment {
  id: number;
  classId: number;
  name: string;
  description: string;
  keywords: string | null;
  weekNumber: number;
  dueDateTime: string;
  assignmentType: AssignmentType;
  isPublic: boolean;
  feedbackCategories: FeedbackCategory[];
  textFile: string;

  audioFile: Blob | null;
  sequentialRegions: Region[] | null;
  maxPlayCount: number | null;
  playbackRate: number | null;
}
interface CreateAssignmentDto {
  classId: number;
  name: string;
  description: string;
  keywords: string | null;
  weekNumber: number;
  dueDateTime: string;
  assignmentType: AssignmentType;
  isPublic: boolean;
  feedbackCategoryIds: number[];
  textFile: string;

  audioFile: Blob | null;
  sequentialRegions: Region[] | null;
  maxPlayCount: number | null;
  playbackRate: number | null;
}
type UpdateAssignmentDto = Partial<CreateAssignmentDto>;

interface Submission {
  id: number;
  student: User;
  assignment: Assignment;
  textFile: string;
  feedbacks: Feedback[];
  staged: boolean;
  generalReview: string | null;
  graded: boolean;
  openedToStudent: boolean;

  audioFile: Blob | null;
  playCount: number | null;
  playbackRate: number | null;
}
interface CreateSubmissionDto {
  studentId: string;
  assignmentId: number;
  textFile: string;
  staged: boolean;

  audioFile: Blob | null;
  playCount: number | null;
  playbackRate: number | null;
}
type UpdateSubmissionDto = Partial<{
  textFile: string;
  staged: boolean;
  generalReview: string | null;
  feedbackIds: number[];
  graded: boolean;
  openedToStudent: boolean;

  audioFile: Blob | null;
  playCount: number | null;
  playbackRate: number | null;
}>;
interface SubmissionStatus {
  studentId: string;
  submissionId: number | null;
  firstName: string;
  lastName: string;
  graded: boolean;
  openedToStudent: boolean;
  submissionDateTime: string | null;
  playCount: number | null;
}

interface FeedbackCategory {
  id: number;
  name: string;
}
interface CreateFeedbackCategoryDto {
  name: string;
  assignmentId: number;
}
interface UpdateFeedbackCategoryDto {
  name: string;
}

interface Feedback {
  id: number;
  submissionId: number;
  professor: User;
  selectedIdx: Region;
  selectedSourceText: boolean;
  comment: string | null;
  categories: FeedbackCategory[];
  staged: boolean;
}
interface CreateFeedbackDto {
  submissionId: number;
  professorId: string;
  selectedIdx: Region;
  selectedSourceText: boolean;
  comment: string | null;
  categoryIds: number[];
  staged: boolean;
}
type UpdateFeedbackDto = Partial<CreateFeedbackDto>;
