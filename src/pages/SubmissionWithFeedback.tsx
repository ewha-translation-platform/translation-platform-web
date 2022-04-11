import {
  FeedbackCard,
  FeedbackCategoryChart,
  Highlightable,
  SurferPlayer,
} from "@/components";
import { UserContext } from "@/contexts";
import { Action, useSubmissionReducer } from "@/hooks";
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
import WaveSurfer from "wavesurfer.js";
import Loading from "./Loading";

interface SubmissionWithFeedbackProps {
  submission: Submission;
  dispatch: Dispatch<Action>;
}

function SubmissionWithFeedback({
  submission,
  dispatch,
}: SubmissionWithFeedbackProps) {
  const [loadingSTT, setLoadingSTT] = useState(false);
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
      if (categories.length === 0) return colorScheme("default");
      if (categories.length >= 2) return colorScheme("danger");
      return colorScheme(
        assignment.feedbackCategories.findIndex(
          (c) => c.id === categories[0].id
        )
      );
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
        toast.warn("중복된 영역을 선택할 수 없습니다.");
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
        feedbackCategoryType:
          assignment.assignmentType === "TRANSLATION"
            ? "TRANSLATION"
            : "INTERPRETATION",
      });
      dispatch({ type: "ADD_CATEGORY", payload: newCategory });
      toast.success(`"${name}" 카테고리가 추가되었습니다.`);
      return newCategory;
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      throw error;
    }
  }

  const timestampLookup = [
    ...Array.from(submission.textFile.matchAll(/\n/g)).map((x) => x.index!),
    submission.textFile.length,
  ].reduce<{ start: number; end: number }[]>(
    (acc, val, idx, arr) => [
      ...acc,
      {
        start: idx === 0 ? 0 : arr[idx - 1] + 1,
        end: val,
      },
    ],
    []
  );

  return (
    <main className="grid grid-rows-[auto_minmax(0,100%)] gap-2 p-4">
      <nav className="flex flex-wrap items-center gap-2">
        <h2>
          {submission.student.lastName}
          {submission.student.firstName} 학생의 과제
        </h2>
        {assignment.assignmentType !== "TRANSLATION" && (
          <>
            <button
              type="button"
              className="btn-sm bg-primary py-1 text-white hover:opacity-70"
              onClick={() => {
                if (
                  !window.confirm(
                    "피드백을 삭제하고 통역 전사문과 기계 피드백을 로드합니다."
                  )
                )
                  return;
                setLoadingSTT(true);
                submissionService
                  .stt(submission.id)
                  .then((submission) => {
                    dispatch({ type: "SET", payload: submission });
                    setLoadingSTT(false);
                    globalThis.location.reload();
                  })
                  .catch((e) => toast.error(e.message))
                  .finally(() => setLoadingSTT(false));
              }}
              disabled={loadingSTT}
            >
              기계 피드백 불러오기
            </button>
            <button
              type="button"
              className="btn-sm bg-orange-400 text-white hover:opacity-70"
              onClick={() => {
                if (assignmentSurfer.current && submissionSurfer.current) {
                  assignmentSurfer.current.playPause();
                  submissionSurfer.current.playPause();
                }
              }}
            >
              동시재생/일시정지
            </button>
          </>
        )}
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
      </nav>
      <div className="grid grid-cols-[1fr_22rem] grid-rows-[1fr_auto] gap-2">
        <div className="row-span-full flex flex-col">
          {assignment.assignmentType !== "TRANSLATION" && (
            <section aria-label="audio-files">
              {assignment.audioFile && (
                <SurferPlayer
                  audioFile={assignment.audioFile}
                  surferRef={assignmentSurfer}
                  regions={assignment.sequentialRegions || []}
                />
              )}
              {submission.audioFile && (
                <SurferPlayer
                  audioFile={submission.audioFile}
                  surferRef={submissionSurfer}
                  regions={submission.timestamps || []}
                  onCreate={(w) => {
                    w.on("region-in", (obj) =>
                      setHighlightedRegions([
                        {
                          ...timestampLookup[+obj.id],
                          selectedSourceText: false,
                          color: colorScheme("default"),
                        },
                      ])
                    );
                    w.on("seek", (progress) => {
                      assignmentSurfer.current?.seekTo(progress);
                    });
                  }}
                />
              )}
            </section>
          )}
          <section className="relative grid flex-grow grid-cols-2 gap-2">
            {loadingSTT && (
              <div className="absolute top-1/2 left-1/2 z-10 box-content grid h-full w-full -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md bg-black p-1 opacity-60">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-4 w-4 animate-ping rounded-full bg-white"></div>
                  <div className="text-2xl text-white">
                    통역 전사문을 불러오는 중입니다.
                  </div>
                </div>
              </div>
            )}
            <section aria-label="origin-text" className="flex flex-col">
              <h3 className="flex items-center justify-between gap-2">원문</h3>
              <Highlightable
                className="flex-grow"
                text={assignment.textFile}
                highlightedRegions={highlightedRegions.filter(
                  ({ selectedSourceText }) => selectedSourceText
                )}
                onSelect={handleSelectFactory(true)}
              />
            </section>
            <section aria-label="target-text" className="flex flex-col">
              {assignment.assignmentType === "TRANSLATION" ? (
                <h3>번역문</h3>
              ) : (
                <h3>통역 전사문</h3>
              )}
              <Highlightable
                className="flex-grow"
                text={submission.textFile}
                highlightedRegions={highlightedRegions.filter(
                  ({ selectedSourceText }) => !selectedSourceText
                )}
                onSelect={handleSelectFactory(false)}
              />
            </section>
          </section>
          <section aria-label="general-review">
            <form
              className="flex flex-col gap-1"
              onSubmit={handleSubmit(async ({ generalReview }) => {
                dispatch({
                  type: "SET_GENERAL_REVIEW",
                  payload: generalReview,
                });
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
                rows={3}
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
          </section>
        </div>
        <section
          aria-label="feedbacks"
          className="hidden-scrollbar min-h-0 overflow-auto"
        >
          <h3>피드백</h3>
          <ul className="flex flex-col gap-2" ref={feedbackListRef}>
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
        <section aria-label="feedback-statistics">
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
      </div>

      {/* <section className="grid grid-cols-[1fr_22rem] grid-rows-[1fr_auto] gap-2">
        <section className="relative grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-2">
          <article className="flex flex-col">
          </article>
          <article className="flex flex-col">
          </article>
        </section>
        <section className="flex min-h-0 flex-col">
        </section>
      </section> */}
    </main>
  );
}

export default function AJAXWrapper() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, dispatch] = useSubmissionReducer();

  useEffect(() => {
    submissionService.getOne(+submissionId!).then((res) => {
      res.assignment.feedbackCategories.sort((a, b) => a.id - b.id);
      dispatch({ type: "SET", payload: res });
    });
  }, [submissionId, dispatch]);

  return submission ? (
    <SubmissionWithFeedback submission={submission} dispatch={dispatch} />
  ) : (
    <Loading />
  );
}
