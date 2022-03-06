import httpService from "./httpService";

export const classService = {
  async getAll(): Promise<Class[]> {
    const { data } = await httpService.get<Class[]>("classes");
    return data;
  },

  async getOne(id: number): Promise<Class> {
    const { data } = await httpService.get<Class>(`classes/${id}`);
    return data;
  },

  async postOne(createClassDto: CreateClassDto) {
    const { data } = await httpService.post<Class>("classes", createClassDto);
    return data;
  },

  async patchOne(id: number, updateClassDto: UpdateClassDto) {
    const { data } = await httpService.patch<Class>(
      `classes/${id}`,
      updateClassDto
    );
    return data;
  },

  async deleteOne(id: number) {
    const { data } = await httpService.delete<Class>(`classes/${id}`);
    return data;
  },

  async getStudents(id: number) {
    const { data } = await httpService.get<User[]>(`classes/${id}/students`);
    return data;
  },

  async addStudent(classId: number, studentId: string) {
    const { data } = await httpService.post(
      `classes/${classId}/students/${studentId}`
    );
    return data;
  },

  async getAssignments(id: number) {
    const { data } = await httpService.get<Assignment[]>(
      `classes/${id}/assignments`
    );
    return data;
  },
};

export const courseService = {
  async getAll(): Promise<Course[]> {
    const { data: courses } = await httpService.get<Course[]>("courses");
    return courses;
  },

  async getOne(id: number): Promise<Course> {
    const { data: course } = await httpService.get<Course>(`courses/${id}`);
    return course;
  },

  async postOne(createCourseDto: CreateCourseDto) {
    const { data: course } = await httpService.post<Course>(
      "courses",
      createCourseDto
    );
    return course;
  },

  async patchOne(id: number, updateCourseDto: UpdateCourseDto) {
    const { data: course } = await httpService.patch<Course>(
      `courses/${id}`,
      updateCourseDto
    );
    return course;
  },

  async deleteOne(id: number) {
    const { data: course } = await httpService.delete<Course>(`courses/${id}`);
    return course;
  },
};
