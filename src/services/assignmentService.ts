import httpService from "./httpService";

const assignmentService = {
  async getAll(): Promise<Assignment[]> {
    const { data: assignments } = await httpService.get<Assignment[]>(
      "assignments"
    );
    return assignments;
  },

  async getOne(id: number): Promise<Assignment> {
    const { data: assignment } = await httpService.get<
      Omit<Assignment, "audioFile">
    >(`assignments/${id}`);

    if (assignment.assignmentType === "TRANSLATION")
      return { ...assignment, audioFile: null };

    const { data: audioFile } = await httpService.get<Blob>(
      `assignments/${id}/audio`,
      { responseType: "blob" }
    );
    return { ...assignment, audioFile };
  },

  async postOne({ audioFile, ...createAssignmentDto }: CreateAssignmentDto) {
    const { data: assignment } = await httpService.post<Assignment>(
      "assignments",
      createAssignmentDto
    );

    const formData = new FormData();
    formData.append("audioFile", audioFile || "");
    await httpService.post(`assignments/${assignment.id}/audio`, formData, {
      headers: { "content-type": "multipart/form-data" },
    });

    return assignment;
  },

  async patchOne(
    id: number,
    { audioFile, ...updateAssignmentDto }: UpdateAssignmentDto
  ) {
    const { data: assignment } = await httpService.patch<Assignment>(
      `assignments/${id}`,
      updateAssignmentDto
    );

    if (audioFile) {
      const formData = new FormData();
      formData.append("audioFile", audioFile || "");
      await httpService.post(`assignments/${id}/audio`, formData, {
        headers: { "content-type": "multipart/form-data" },
      });
    }

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
