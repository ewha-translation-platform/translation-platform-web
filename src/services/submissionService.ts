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

    if (submission.assignment.assignmentType === "TRANSLATION")
      return { ...submission, audioFile: null };

    const audioFile = await httpService
      .get<Blob>(`submissions/${id}/audio`, { responseType: "blob" })
      .then(({ data }) => data)
      .catch(() => null);

    return { ...submission, audioFile };
  },

  async postOne({ audioFile, ...createSubmissionDto }: CreateSubmissionDto) {
    const { data: submission } = await httpService.post<Submission>(
      "submissions",
      createSubmissionDto
    );

    if (audioFile) {
      const formData = new FormData();
      formData.append("audioFile", audioFile || "");
      await httpService.post(`submissions/${submission.id}/audio`, formData, {
        headers: { "content-type": "multipart/form-data" },
      });
    }

    return submission;
  },

  async patchOne(
    id: number,
    { audioFile, ...updateSubmissionDto }: UpdateSubmissionDto
  ) {
    const { data: submission } = await httpService.patch<Submission>(
      `submissions/${id}`,
      updateSubmissionDto
    );

    if (audioFile) {
      const formData = new FormData();
      formData.append("audioFile", audioFile || "");
      await httpService.post(`submissions/${id}/audio`, formData, {
        headers: { "content-type": "multipart/form-data" },
      });
    }

    return submission;
  },

  async patchMany(ids: number[], updateSubmissionDto: UpdateSubmissionDto) {
    const {
      data: { count },
    } = await httpService.patch<{ count: number }>("submissions/batch", {
      ids,
      dto: updateSubmissionDto,
    });
    return count;
  },

  async deleteOne(id: number) {
    const { data: submission } = await httpService.delete<Submission>(
      `submissions/${id}`
    );
    return submission;
  },

  async stage(id: number) {
    await httpService.post(`submissions/${id}/stage`);
  },
};

export default submissionService;
