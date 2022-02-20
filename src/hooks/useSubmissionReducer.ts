import { useReducer } from "react";

export type Action =
  | { type: "SET"; payload: Submission }
  | { type: "ADD_FEEDBACK"; payload: Feedback }
  | {
      type: "PATCH_FEEDBACK";
      payload: {
        targetId: number;
        comment: string | null;
        categoryIds: number[];
      };
    }
  | { type: "DELETE_FEEDBACK"; payload: number }
  | { type: "ADD_CATEGORY"; payload: FeedbackCategory }
  | { type: "SET_GENERAL_REVIEW"; payload: string }
  | { type: "SET_GRADED"; payload: boolean };

function reducer(
  submission: Submission | null,
  action: Action
): Submission | null {
  if (action.type === "SET") return action.payload;
  if (!submission) return null;
  switch (action.type) {
    case "ADD_FEEDBACK":
      return {
        ...submission,
        feedbacks: [...submission.feedbacks, action.payload],
      };
    case "PATCH_FEEDBACK":
      return {
        ...submission,
        feedbacks: submission.feedbacks.map((f) =>
          f.id === action.payload.targetId
            ? {
                ...f,
                comment: action.payload.comment,
                categories: submission.assignment.feedbackCategories.filter(
                  (c) => action.payload.categoryIds.includes(c.id)
                ),
              }
            : f
        ),
      };
    case "ADD_CATEGORY":
      return {
        ...submission,
        assignment: {
          ...submission.assignment,
          feedbackCategories: [
            ...submission.assignment.feedbackCategories,
            action.payload,
          ],
        },
      };
    case "DELETE_FEEDBACK":
      return {
        ...submission,
        feedbacks: submission.feedbacks.filter((f) => f.id !== action.payload),
      };
    case "SET_GENERAL_REVIEW":
      return { ...submission, generalReview: action.payload };
    case "SET_GRADED":
      return { ...submission, graded: action.payload };
    default:
      return submission;
  }
}

function useSubmissionReducer() {
  return useReducer(reducer, null);
}

export default useSubmissionReducer;
