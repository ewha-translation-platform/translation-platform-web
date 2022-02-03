import httpService from "./httpService";

const assignmentService = {
  async getAll(): Promise<Assignment[]> {
    const { data: assignments } = await httpService.get<Assignment[]>(
      "assignments"
    );
    return assignments;
  },

  async getOne(id: number): Promise<Assignment> {
    const { data: assignment } = await httpService.get<Assignment>(
      `assignments/${id}`
    );
    return assignment;
  },

  async postOne(createAssignmentDto: CreateAssignmentDto) {
    const { data: assignment } = await httpService.post<Assignment>(
      "assignments",
      createAssignmentDto
    );
    return assignment;
  },

  async patchOne(id: number, updateAssignmentDto: UpdateAssignmentDto) {
    const { data: assignment } = await httpService.patch<Assignment>(
      `assignments/${id}`,
      updateAssignmentDto
    );
    return assignment;
  },

  async deleteOne(id: number) {
    const { data: assignment } = await httpService.delete<Assignment>(
      `assignments/${id}`
    );
    return assignment;
  },

  async getSubmissionStatuses(id: number): Promise<SubmissionStatus[]> {
    const { data } = await httpService.get<SubmissionStatus[]>(
      `assignments/${id}/submissions`
    );
    return data;
  },
};

export default assignmentService;
