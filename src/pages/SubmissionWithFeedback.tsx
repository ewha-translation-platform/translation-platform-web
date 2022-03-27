import {
  FeedbackCard,
  FeedbackCategoryChart,
  Highlightable,
  SurferPlayer,
} from "@/components";
import { UserContext } from "@/contexts";
import { Action } from "@/hooks";
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
import Switch from "react-switch";
import { toast } from "react-toastify";
import Loading from "./Loading";
import WaveSurfer from "wavesurfer.js";
import ReactSwitch from "react-switch";

interface SubmissionWithFeedbackProps {
  submission: Submission;
  dispatch: Dispatch<Action>;
}

function SubmissionWithFeedback({
  submission,
  dispatch,
}: SubmissionWithFeedbackProps) {
  const [isVolBig, setIsVolBig] = useState(false);
  const assignmentSurfer = useRef<WaveSurfer>();
  const submissionSurfer = useRef<WaveSurfer>();
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
      <nav className="flex flex-wrap items-center gap-2">
        <h2>
          {submission.student.lastName}
          {submission.student.firstName} 학생의 과제
        </h2>
        <button
          type="button"
          className="btn bg-primary py-1 text-white"
          onClick={() => {
            if (!assignmentSurfer.current || !submissionSurfer.current) return;
            if (assignment.assignmentType === "SIMULTANEOUS")
              assignmentSurfer.current.setVolume(0.2);
            assignmentSurfer.current.play(0);
            submissionSurfer.current.play(0);
          }}
        >
          전체 듣기
        </button>
        <label className="mr-auto flex items-center gap-2">
          <Switch
            checked={submission.graded}
            onChange={(graded) => {
              dispatch({ type: "SET_GRADED", payload: graded });
              submissionService
                .patchOne(
                  submission.id,
                  graded ? { graded } : { graded, openedToStudent: false }
                )
                .then(() => {
                  toast.success("채점 상태를 변경하였습니다.");
                })
                .catch((err: Error) => {
                  toast.error(err.message);
                  dispatch({ type: "SET_GRADED", payload: !graded });
                });
            }}
          ></Switch>
          채점 완료로 표시
        </label>
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
            <h3 className="flex items-center justify-between gap-2">
              원문
              {assignment.assignmentType === "SIMULTANEOUS" && (
                <label className="flex items-center gap-2 text-base font-normal">
                  소리 크게
                  <ReactSwitch
                    checked={isVolBig}
                    onChange={() => {
                      assignmentSurfer.current?.setVolume(isVolBig ? 0.2 : 1);
                      setIsVolBig(!isVolBig);
                    }}
                    checkedIcon={false}
                    uncheckedIcon={false}
                  />
                </label>
              )}
            </h3>
            {assignment.assignmentType !== "TRANSLATION" &&
              assignment.audioFile && (
                <SurferPlayer
                  audioFile={assignment.audioFile}
                  surferRef={assignmentSurfer}
                  regions={assignment.sequentialRegions || []}
                />
              )}
            <Highlightable
              className="flex-grow"
              text={assignment.textFile}
              highlightedRegions={highlightedRegions.filter(
                ({ selectedSourceText }) => selectedSourceText
              )}
              onSelect={handleSelectFactory(true)}
            />
          </article>
          <article className="flex flex-col">
            {assignment.assignmentType === "TRANSLATION" ? (
              <h3>번역문</h3>
            ) : (
              <h3>통역 전사문</h3>
            )}
            {assignment.assignmentType !== "TRANSLATION" &&
              submission.audioFile && (
                <SurferPlayer
                  audioFile={submission.audioFile}
                  surferRef={submissionSurfer}
                  regions={submission.sequentialRegions || []}
                />
              )}
            <Highlightable
              className="flex-grow"
              text={submission.textFile}
              highlightedRegions={highlightedRegions.filter(
                ({ selectedSourceText }) => !selectedSourceText
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
            <li className="flex flex-col items-center rounded-md border-2 border-dashed border-primary p-4">
              <PlusIcon className="h-16 w-16 fill-primary" />
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
            className="btn self-end bg-primary text-white"
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
