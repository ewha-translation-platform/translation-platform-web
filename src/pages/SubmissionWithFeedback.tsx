import {
  FeedbackCard,
  Highlightable,
  FeedbackCategoryChart,
} from "@/components";
import { UserContext } from "@/contexts";
import { useSubmissionReducer } from "@/hooks";
import {
  feedbackCategoryService,
  feedbackService,
  submissionService,
} from "@/services";
import { colorScheme } from "@/utils";
import { PlusIcon } from "@heroicons/react/solid";
import {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "./Loading";

interface SubmissionWithFeedbackProps {
  submission: Submission;
  dispatch: Dispatch<any>;
}

function SubmissionWithFeedback({
  submission,
  dispatch,
}: SubmissionWithFeedbackProps) {
  const { user } = useContext(UserContext);
  const feedbackListRef = useRef<HTMLUListElement>(null);

  const getColorByCategories = useCallback(
    (categories: FeedbackCategory[]) => {
      switch (categories.length) {
        case 0:
          return colorScheme("default");
        case 1:
          return colorScheme(
            submission.assignment.feedbackCategories.findIndex(
              (c) => c.id === categories[0].id
            )
          );
        default:
          return colorScheme("danger");
      }
    },
    [submission]
  );

  const feedbackToHighlight = useCallback(
    ({ categories, selectedIdx, selectedSourceText }: Feedback) => {
      return {
        color: getColorByCategories(categories),
        selectedSourceText,
        ...selectedIdx,
      };
    },
    [getColorByCategories]
  );

  const [highlightedRegions, setHighlightedRegions] = useState<
    { color: string; start: number; end: number; selectedSourceText: boolean }[]
  >(submission.feedbacks.map(feedbackToHighlight));

  function handleSelectFactory(selectedSourceText: boolean) {
    return async ({ start, end }: Region) => {
      if (start === end) return;
      if (
        submission.feedbacks
          .filter((f) => f.selectedSourceText === selectedSourceText)
          .find(({ selectedIdx: { start: s, end: e } }) => s < end && start < e)
      ) {
        toast.warn("중복된 영억을 선택할 수 없습니다.");
        return;
      }

      try {
        const newFeedback = await feedbackService.postOne({
          selectedIdx: { start, end },
          selectedSourceText,
          categoryIds: [],
          comment: "",
          professorId: user!.id,
          submissionId: submission.id,
          staged: false,
        });
        dispatch({ type: "ADD_FEEDBACK", payload: newFeedback });
        setHighlightedRegions([
          {
            color: colorScheme("default"),
            start,
            end,
            selectedSourceText: selectedSourceText,
          },
        ]);
        feedbackListRef.current?.scrollBy({
          behavior: "smooth",
          top: feedbackListRef.current.scrollHeight,
        });
      } catch (error) {
        if (error instanceof Error) toast.error(error.message);
      }
    };
  }

  function handleMouseEnter(feedback: Feedback) {
    setHighlightedRegions([feedbackToHighlight(feedback)]);
  }

  function handleMouseLeave() {
    setHighlightedRegions(submission.feedbacks.map(feedbackToHighlight));
  }

  async function handlePatchFeedback(
    targetId: number,
    comment: string | null,
    categoryIds: number[]
  ) {
    try {
      await feedbackService.patchOne(targetId, { comment, categoryIds });
      dispatch({
        type: "PATCH_FEEDBACK",
        payload: { targetId, comment, categoryIds },
      });
      toast.success("피드백이 업데이트되었습니다.");
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function handleDeleteFeedback(targetId: number) {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await feedbackService.deleteOne(targetId);
      dispatch({ type: "DELETE_FEEDBACK", payload: targetId });
      toast.success("삭제되었습니다.");
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function handleCreateCategory(name: string) {
    try {
      const newCategory = await feedbackCategoryService.postOne({
        name,
        assignmentId: submission.assignment.id,
      });
      dispatch({ type: "ADD_CATEGORY", payload: newCategory });
      toast.success(`"${name}" 카테고리가 추가되었습니다.`);
      return newCategory;
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      throw error;
    }
  }

  return (
    <main className="grid grid-rows-[auto_minmax(0,100%)] gap-2 p-4">
      <nav className="flex flex-wrap items-start gap-2">
        <h2 className="mr-auto">
          {submission.student.lastName}
          {submission.student.firstName} 학생의 과제
        </h2>
        <button className="btn bg-primary text-white" disabled>
          이전 학생
        </button>
        <button className="btn bg-primary text-white" disabled>
          다음 학생
        </button>
        <button className="btn bg-secondary-500 text-white" disabled>
          임시 저장
        </button>
        <button
          className="btn bg-primary text-white hover:opacity-80"
          onClick={(e) => {
            e.preventDefault();
            submissionService.patchOne(submission.id, {
              generalReview: submission.generalReview,
              feedbackIds: submission.feedbacks.map((f) => f.id),
            });
          }}
        >
          저장
        </button>
      </nav>
      <section className="grid grid-cols-[1fr_20rem] grid-rows-[1fr_min-content] gap-2">
        <section className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-2">
          <article className="flex flex-col">
            <h3>원문</h3>
            {submission.assignment.assignmentType !== "TRANSLATION" && (
              <audio controls className="w-full"></audio>
            )}
            <Highlightable
              className="flex-grow"
              text={submission.assignment.textFile}
              highlightedRegions={highlightedRegions.filter(
                ({ selectedSourceText: selectedOrigin }) => selectedOrigin
              )}
              onSelect={handleSelectFactory(true)}
            />
          </article>
          <article className="flex flex-col">
            <h3>번역문</h3>
            {submission.assignment.assignmentType !== "TRANSLATION" && (
              <audio controls className="w-full"></audio>
            )}
            <Highlightable
              className="flex-grow"
              text={submission.textFile}
              highlightedRegions={highlightedRegions.filter(
                ({ selectedSourceText: selectedOrigin }) => !selectedOrigin
              )}
              onSelect={handleSelectFactory(false)}
            />
          </article>
        </section>
        <section className="flex min-h-0 flex-col">
          <h3>피드백</h3>
          <ul
            className="hidden-scrollbar flex flex-col gap-2 overflow-auto"
            ref={feedbackListRef}
          >
            {submission.feedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                selectedText={(feedback.selectedSourceText
                  ? submission.assignment.textFile
                  : submission.textFile
                ).slice(feedback.selectedIdx.start, feedback.selectedIdx.end)}
                backgroundColor={getColorByCategories(feedback.categories)}
                categories={submission.assignment.feedbackCategories}
                onMouseEnter={() => handleMouseEnter(feedback)}
                onMouseLeave={handleMouseLeave}
                onDelete={handleDeleteFeedback}
                onCreateCategory={handleCreateCategory}
                onChangeFeedback={handlePatchFeedback}
              />
            ))}
            <li className="border-primary flex flex-col items-center rounded-md border-2 border-dashed p-4">
              <PlusIcon className="fill-primary h-16 w-16" />
              <span className="text-sm">
                추가하려면 번역문 창에서 텍스트를 선택하세요
              </span>
            </li>
          </ul>
        </section>
        <section>
          <h3>총평</h3>
          <textarea
            className="w-full resize-none"
            placeholder="총평을 입력하세요."
            rows={6}
            onChange={(e) =>
              dispatch({ type: "SET_GENERAL_REVIEW", payload: e.target.value })
            }
            value={submission.generalReview || ""}
          ></textarea>
        </section>
        <FeedbackCategoryChart
          categories={submission.assignment.feedbackCategories}
          data={submission.feedbacks.reduce<Record<number, number>>(
            (result, f) => {
              f.categories.forEach((c) => {
                result[c.id] = c.id in result ? result[c.id] + 1 : 1;
              });
              return result;
            },
            {}
          )}
        />
      </section>
    </main>
  );
}

export default function AJAXWrapper() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, dispatch] = useSubmissionReducer();

  useEffect(() => {
    submissionService.getOne(+submissionId!).then((res) => {
      dispatch({ type: "SET", payload: res });
    });
  }, [submissionId, dispatch]);

  return submission ? (
    <SubmissionWithFeedback submission={submission} dispatch={dispatch} />
  ) : (
    <Loading />
  );
}
