import { users } from "./userService";

export const feedbackService = {
  async getAll(): Promise<Feedback[]> {
    return Promise.resolve(
      feedbacks.map(({ categoryIds, professorId, ...rests }) => ({
        categories: categoryIds.map((id) => feedbackCategories[id]),
        professor: users[professorId],
        ...rests,
      }))
    );
  },
  async getOne(id: number): Promise<Feedback> {
    const { categoryIds, professorId, ...rests } = feedbacks[id];
    return Promise.resolve({
      categories: categoryIds.map((id) => feedbackCategories[id]),
      professor: users[professorId],
      ...rests,
    });
  },
  async postOne(feedbackDto: FeedbackDto): Promise<Feedback> {
    const newFeedback: FeedbackModel = {
      id: feedbacks.length,
      ...feedbackDto,
    };
    feedbacks.push(newFeedback);
    return Promise.resolve(await this.getOne(newFeedback.id));
  },
  async putOne(targetId: number, feedbackDto: Partial<FeedbackDto>) {
    feedbacks = feedbacks.map((f) =>
      f.id === targetId ? { ...f, ...feedbackDto } : f
    );
    return Promise.resolve(true);
  },
  async deleteOne(targetId: number): Promise<boolean> {
    feedbacks = feedbacks.filter((f) => f.id !== targetId);
    return Promise.resolve(true);
  },
};

export const feedbackCategoryService = {
  async getAll(): Promise<FeedbackCategory[]> {
    return Promise.resolve(feedbackCategories);
  },
  async getOne(id: number): Promise<FeedbackCategory> {
    return Promise.resolve(feedbackCategories[id]);
  },
  async postOne(feedbackCategoryDto: FeedbackCategoryDto) {
    const newFeedbackCategory: FeedbackCategoryModel = {
      id: feedbackCategories.length,
      ...feedbackCategoryDto,
    };
    feedbackCategories.push(newFeedbackCategory);
    return Promise.resolve(newFeedbackCategory);
  },
};

export const feedbackCategories: FeedbackCategoryModel[] = [
  { id: 0, name: "내용 오역" },
  { id: 1, name: "불필요한 첨가" },
  { id: 2, name: "표기, 맞춤법 오류" },
  { id: 3, name: "문법 오류" },
  { id: 4, name: "일관성 문제" },
  { id: 5, name: "표현 어색" },
  { id: 6, name: "문제 부적합" },
  { id: 7, name: "칭찬" },
];

export let feedbacks: FeedbackModel[] = [
  {
    id: 0,
    selectedIdx: { start: 8, end: 30 },
    selectedOrigin: false,
    comment: "불필요한",
    professorId: 0,
    categoryIds: [3],
    submissionId: 0,
    isTemporal: false,
  },
  {
    id: 1,
    selectedIdx: { start: 31, end: 50 },
    selectedOrigin: false,
    comment: "불필요한",
    professorId: 0,
    categoryIds: [2],
    submissionId: 0,
    isTemporal: false,
  },
  {
    id: 2,
    selectedIdx: { start: 51, end: 70 },
    selectedOrigin: false,
    comment: "불필요한",
    professorId: 0,
    categoryIds: [1],
    submissionId: 0,
    isTemporal: false,
  },
];
