import {
  FeedbackCard,
  FeedbackCategoryChart,
  Highlightable,
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
import { useForm } from "react-hook-form";
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
  const { assignment, feedbacks } = submission;
  const { user } = useContext(UserContext);
  const feedbackListRef = useRef<HTMLUListElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<{ generalReview: string }>({
    defaultValues: { generalReview: submission.generalReview || "" },
  });

  const getColorByCategories = useCallback(
    (categories: FeedbackCategory[]) => {
      switch (categories.length) {
        case 0:
          return colorScheme("default");
        case 1:
          return colorScheme(
            assignment.feedbackCategories.findIndex(
              (c) => c.id === categories[0].id
            )
          );
        default:
          return colorScheme("danger");
      }
    },
    [assignment]
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
  >(feedbacks.map(feedbackToHighlight));

  function handleSelectFactory(selectedSourceText: boolean) {
    return async ({ start, end }: Region) => {
      if (start === end) return;
      if (
        feedbacks
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
    setHighlightedRegions(feedbacks.map(feedbackToHighlight));
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
        assignmentId: assignment.id,
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
        <button
          className="btn bg-primary text-white hover:opacity-80"
          onClick={async (e) => {
            e.preventDefault();
            try {
              await submissionService.stage(submission.id);
              toast.success("피드백을 학생에게 공개합니다.");
            } catch (error) {
              if (error instanceof Error) toast.error(error.message);
            }
          }}
        >
          저장
        </button>
      </nav>
      <section className="grid grid-cols-[1fr_22rem] grid-rows-[1fr_auto] gap-2">
        <section className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-2">
          <article className="flex flex-col">
            <h3>원문</h3>
            {assignment.assignmentType !== "TRANSLATION" && (
              <audio controls className="w-full"></audio>
            )}
            <Highlightable
              className="flex-grow"
              text={assignment.textFile}
              highlightedRegions={highlightedRegions.filter(
                ({ selectedSourceText: selectedOrigin }) => selectedOrigin
              )}
              onSelect={handleSelectFactory(true)}
            />
          </article>
          <article className="flex flex-col">
            <h3>번역문</h3>
            {assignment.assignmentType !== "TRANSLATION" && (
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
            {feedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                selectedText={(feedback.selectedSourceText
                  ? assignment.textFile
                  : submission.textFile
                ).slice(feedback.selectedIdx.start, feedback.selectedIdx.end)}
                backgroundColor={getColorByCategories(feedback.categories)}
                categories={assignment.feedbackCategories}
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
                추가하려면 원문/번역문 창에서 텍스트를 선택하세요
              </span>
            </li>
          </ul>
        </section>
        <form
          className="flex flex-col gap-1"
          onSubmit={handleSubmit(async ({ generalReview }) => {
            dispatch({ type: "SET_GENERAL_REVIEW", payload: generalReview });
            try {
              await submissionService.patchOne(submission.id, {
                generalReview,
              });
              toast.success("총평을 저장하였습니다");
              reset({ generalReview });
            } catch (error) {
              if (error instanceof Error) toast.error(error.message);
            }
          })}
        >
          <h3>총평</h3>
          <textarea
            className="w-full resize-none"
            placeholder="총평을 입력하세요."
            rows={6}
            {...register("generalReview")}
          ></textarea>
          <button
            type="submit"
            className="btn bg-primary self-end text-white"
            disabled={!isDirty || isSubmitting}
          >
            {isDirty ? "저장" : "저장됨"}
          </button>
        </form>
        <FeedbackCategoryChart
          categories={assignment.feedbackCategories}
          data={feedbacks.reduce<Record<number, number>>((result, f) => {
            f.categories.forEach((c) => {
              result[c.id] = c.id in result ? result[c.id] + 1 : 1;
            });
            return result;
          }, {})}
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
