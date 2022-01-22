import { users } from "./userService";

export const classService = {
  async getAll(): Promise<Class[]> {
    return Promise.resolve(
      classes.map(({ courseId, professorIds, studentIds, ...rests }) => ({
        course: courses[courseId],
        professors: professorIds.map((id) => users[id]),
        students: studentIds.map((id) => users[id]),
        ...rests,
      }))
    );
  },
  async getOne(id: number): Promise<Class> {
    const { courseId, professorIds, studentIds, ...rests } = classes[id];
    return Promise.resolve({
      course: courses[courseId],
      professors: professorIds.map((id) => users[id]),
      students: studentIds.map((id) => users[id]),
      ...rests,
    });
  },
  async postOne(classDto: CreateClassDto): Promise<Class> {
    const newClass: ClassModel = {
      id: classes.length,
      ...classDto,
    };
    classes.push(newClass);
    return Promise.resolve(await this.getOne(newClass.id));
  },
  async deleteOne(targetId: number): Promise<boolean> {
    classes = classes.filter(({ id }) => id !== targetId);
    return Promise.resolve(true);
  },
};

export const courseService = {
  async getAll(): Promise<Course[]> {
    return Promise.resolve(courses);
  },
  async getOne(id: number): Promise<Course> {
    return Promise.resolve(courses[id]);
  },
  async postOne(course: CreateCourseDto): Promise<Course> {
    const newCourse = { id: courses.length, ...course };
    courses.push(newCourse);
    return Promise.resolve(newCourse);
  },
};

let courses: CourseModel[] = [
  {
    id: 0,
    name: "[영] 문학번역",
    code: "[학수번호]",
    year: 2022,
    semester: "fall",
  },
  {
    id: 1,
    name: "[영] 기술번역",
    code: "[학수번호]",
    year: 2022,
    semester: "spring",
  },
  {
    id: 2,
    name: "[일] 문학번역",
    code: "[학수번호]",
    year: 2022,
    semester: "fall",
  },
  {
    id: 3,
    name: "[일] 기술번역",
    code: "[학수번호]",
    year: 2022,
    semester: "spring",
  },
  {
    id: 4,
    name: "[중] 문학번역",
    code: "[학수번호]",
    year: 2022,
    semester: "fall",
  },
  {
    id: 5,
    name: "[중] 기술번역",
    code: "[학수번호]",
    year: 2022,
    semester: "spring",
  },
];

export let classes: ClassModel[] = [
  {
    id: 0,
    courseId: 0,
    classNumber: 1,
    studentIds: [1, 2, 3],
    professorIds: [0],
  },
  {
    id: 1,
    courseId: 1,
    classNumber: 1,
    studentIds: [1, 2, 3],
    professorIds: [0],
  },
  {
    id: 2,
    courseId: 2,
    classNumber: 1,
    studentIds: [1, 2, 3],
    professorIds: [0],
  },
  {
    id: 3,
    courseId: 3,
    classNumber: 1,
    studentIds: [1, 2, 3],
    professorIds: [0],
  },
  {
    id: 4,
    courseId: 4,
    classNumber: 1,
    studentIds: [1, 2, 3],
    professorIds: [0],
  },
  {
    id: 5,
    courseId: 5,
    classNumber: 1,
    studentIds: [1, 2, 3],
    professorIds: [0],
  },
];
