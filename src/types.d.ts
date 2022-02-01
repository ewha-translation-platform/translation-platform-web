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
}

interface User {
  id: number;
  academicId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  college: string;
  role: Role;
  isAdmin: boolean;
}
interface CreateUserDto {
  academicId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}
type UpdateUserDto = Omit<CreateUserDto, "academicId">;

interface Course {
  id: number;
  year: number;
  semester: Semester;
  department: string;
  college: string;
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
  courseId: Integer;
  classNumber: number;
}
type UpdateClassDto = Partial<CreateClassDto>;

interface Assignment {
  id: number;
  classId: number;
  name: string;
  description: string;
  weekNumber: number;
  dueDateTime: string;
  assignmentType: AssignmentType;
  isPublic: boolean;
  maxScore: number;
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
  weekNumber: number;
  dueDateTime: string;
  assignmentType: AssignmentType;
  isPublic: boolean;
  maxScore: number;
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
  score: number | null;
  staged: boolean;
  generalReview: string | null;
  graded: boolean;

  audioFile: Blob | null;
  playCount: number | null;
  playbackRate: number | null;
}
interface CreateSubmissionDto {
  studentId: number;
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
  score: boolean | null;
  feedbackIds: number[];
  graded: boolean;

  audioFile: Blob | null;
  playCount: number | null;
  playbackRate: number | null;
}>;
interface SubmissionStatus {
  academicId: string;
  submissionId: number | null;
  firstName: string;
  lastName: string;
  isGraded: boolean;
  submissionDateTime: string | null;
  playCount: number | null;
}

interface FeedbackCategory {
  id: number;
  name: string;
}
interface CreateFeedbackCategoryDto {
  name: string;
}
type UpdateFeedbackCategoryDto = Partial<CreateFeedbackCategoryDto>;

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
  professorId: number;
  selectedIdx: Region;
  selectedSourceText: boolean;
  comment: string | null;
  categoryIds: number[];
  staged: boolean;
}
type UpdateFeedbackDto = Partial<CreateFeedbackDto>;
