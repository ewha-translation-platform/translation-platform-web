import httpService from "./httpService";

const submissionService = {
  async getAll(): Promise<Submission[]> {
    const { data: submissions } = await httpService.get<Submission[]>(
      "submissions"
    );
    return submissions;
  },

  async getOne(id: number): Promise<Submission> {
    const { data: submission } = await httpService.get<Submission>(
      `submissions/${id}`
    );
    return submission;
  },

  async postOne(createSubmissionDto: CreateSubmissionDto) {
    const { data: submission } = await httpService.post<Submission>(
      "submissions",
      createSubmissionDto
    );
    return submission;
  },

  async patchOne(id: number, updateSubmissionDto: UpdateSubmissionDto) {
    const { data: submission } = await httpService.patch<Submission>(
      `submissions/${id}`,
      updateSubmissionDto
    );
    return submission;
  },

  async deleteOne(id: number) {
    const { data: submission } = await httpService.delete<Submission>(
      `submissions/${id}`
    );
    return submission;
  },

  async stage(id: number) {
    return Promise.resolve("OK");
  },
};

export default submissionService;
