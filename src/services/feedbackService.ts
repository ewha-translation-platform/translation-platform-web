import httpService from "./httpService";

export const feedbackService = {
  async getAll(): Promise<Feedback[]> {
    const { data: feedbacks } = await httpService.get<Feedback[]>("feedbacks");
    return feedbacks;
  },

  async getOne(id: number): Promise<Feedback> {
    const { data: feedback } = await httpService.get<Feedback>(
      `feedbacks/${id}`
    );
    return feedback;
  },

  async postOne(createFeedbackDto: CreateFeedbackDto) {
    const { data: feedback } = await httpService.post<Feedback>(
      "feedbacks",
      createFeedbackDto
    );
    return feedback;
  },

  async patchOne(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    const { data: feedback } = await httpService.patch<Feedback>(
      `feedbacks/${id}`,
      updateFeedbackDto
    );
    return feedback;
  },

  async deleteOne(id: number) {
    const { data: feedback } = await httpService.delete<Feedback>(
      `feedbacks/${id}`
    );
    return feedback;
  },
};

export const feedbackCategoryService = {
  async getAll(): Promise<FeedbackCategory[]> {
    const { data: feedbackCategories } = await httpService.get<
      FeedbackCategory[]
    >("feedback-categories");
    return feedbackCategories;
  },

  async getOne(id: number): Promise<FeedbackCategory> {
    const { data: feedbackCategory } = await httpService.get<FeedbackCategory>(
      `feedback-categories/${id}`
    );
    return feedbackCategory;
  },

  async postOne(createFeedbackCategoryDto: CreateFeedbackCategoryDto) {
    const { data: feedbackCategory } = await httpService.post<FeedbackCategory>(
      "feedback-categories",
      createFeedbackCategoryDto
    );
    return feedbackCategory;
  },

  async patchOne(
    id: number,
    updateFeedbackCategoryDto: UpdateFeedbackCategoryDto
  ) {
    const { data: feedbackCategory } =
      await httpService.patch<FeedbackCategory>(
        `feedback-categories/${id}`,
        updateFeedbackCategoryDto
      );
    return feedbackCategory;
  },

  async deleteOne(id: number) {
    const { data: feedbackCategory } =
      await httpService.delete<FeedbackCategory>(`feedback-categories/${id}`);
    return feedbackCategory;
  },
};
