interface Option<V = string | number> {
  label: string;
  value: V;
}

type AssignmentType = "translate" | "simultaneous" | "sequential";
type Semester = "spring" | "summer" | "fall" | "winter";
type Role = "professor" | "assistant" | "student";

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
  collegeName: string;
  departmentName: string;
  isAdmin: boolean;
  role: Role;
}
type UserModel = User;
type UserDto = Omit<UserModel, "id">;

interface Course {
  id: number;
  year: number;
  semester: Semester;
  code: string;
  name: string;
}
type CourseModel = Course;
type CourseDto = Omit<CourseModel, "id">;

interface Class {
  id: number;
  course: Course;
  classNumber: number;
  students: User[];
  professors: User[];
}
interface ClassModel {
  id: number;
  courseId: number;
  classNumber: number;
  studentIds: number[];
  professorIds: number[];
}
type ClassDto = Omit<ClassModel, "id">;

interface Region {
  start: number;
  end: number;
}
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
  audioFile?: any;
  sequentialRegions: Region[];
  maxPlayCount: number;
  playbackRate: number;
}
interface AssignmentModel {
  id: number;
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
  audioFile?: any;
  sequentialRegions: Region[];
  maxPlayCount: number;
  playbackRate: number;
}
type AssignmentDto = Omit<AssignmentModel, "id">;

interface Submission {
  id: number;
  student: User;
  assignment: Assignment;
  textFile: string;
  audioFile?: any;
  playCount: number;
  playbackRate: number;
  generalReview: string;
  score: number;
  isGraded: boolean;
  isTemporal: boolean;
  feedbacks: Feedback[];
}

interface SubmissionModel {
  id: number;
  studentId: number;
  assignmentId: number;
  textFile: string;
  audioFile?: any;
  playCount: number;
  playbackRate: number;
  generalReview: string;
  score: number;
  isGraded: boolean;
  isTemporal: boolean;
  feedbackIds: number[];
}
interface CreateSubmissionDto {
  studentId: number;
  assignmentId: number;
  textFile: string;
  audioFile?: any;
  playCount: number;
  playbackRate: number;
  isTemporal: boolean;
}
interface PutSubmissionDto {
  id: number;
  textFile?: string;
  audioFile?: any;
  playCount?: number;
  playbackRate?: number;
  generalReview?: string;
  score?: number;
  isGraded?: boolean;
  feedbackIds?: number[];
}

interface SubmissionStatus {
  academicId: string;
  submissionId: number | null;
  firstName: string;
  lastName: string;
  isGraded: boolean;
  submissionDateTime: string;
  playCount: number;
}

interface FeedbackCategory {
  id: number;
  name: string;
}
type FeedbackCategoryModel = feedbackCategory;
type FeedbackCategoryDto = Omit<FeedbackCategoryModel, "id">;

interface Feedback {
  id: number;
  submissionId: number;
  professor: User;
  selectedIdx: Region;
  selectedOrigin: boolean;
  comment: string;
  categories: FeedbackCategory[];
  isTemporal: boolean;
}
interface FeedbackModel {
  id: number;
  submissionId: number;
  professorId: number;
  selectedIdx: Region;
  selectedOrigin: boolean;
  comment: string;
  categoryIds: number[];
  isTemporal: boolean;
}
type FeedbackDto = Omit<FeedbackModel, "id">;
