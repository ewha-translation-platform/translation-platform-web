import { PlusIcon } from "@heroicons/react/solid";
import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Pie } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import { FeedbackCard, Highlightable } from "@/components";
import { UserContext } from "@/contexts";
import {
  feedbackCategoryService,
  feedbackService,
  submissionService,
} from "@/services";
import { colorScheme } from "@/utils";
import { useSubmissionReducer } from "@/hooks";

function SubmissionWithFeedback() {
  const { user } = useContext(UserContext);
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, dispatch] = useSubmissionReducer();
  const [highlightedRegions, setHighlightedRegions] = useState<
    { color: string; start: number; end: number; selectedOrigin: boolean }[]
  >([]);
  const feedbackListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    Chart.register(ArcElement, Tooltip, Legend);
    (async function () {
      const result = await submissionService.getOne(+submissionId!);
      dispatch({ type: "SET", payload: result });
      setHighlightedRegions(
        result.feedbacks.map(({ categories, selectedIdx, selectedOrigin }) => ({
          color:
            categories.length === 1
              ? colorScheme(
                  result.assignment.feedbackCategories.findIndex(
                    (c) => c.id === categories[0].id
                  )
                )
              : colorScheme("danger"),
          selectedOrigin,
          ...selectedIdx,
        }))
      );
    })();
  }, [submissionId, dispatch]);

  const chartData = useMemo(() => {
    if (!submission) {
      return { labels: [], datasets: [] };
    }

    type Result = Record<number, { name: string; cnt: number }>;
    const acc = submission.feedbacks.reduce<Result>((result, f) => {
      f.categories.forEach((c) => {
        if (c.id in result) result[c.id].cnt++;
        else {
          result[c.id] = { name: c.name, cnt: 1 };
        }
      });
      return result;
    }, {});
    return {
      labels: Object.values(acc).map((c) => c.name),
      datasets: [
        {
          data: Object.values(acc).map((c) => c.cnt),
          backgroundColor: Object.keys(acc).map((id) =>
            colorScheme(
              submission.assignment.feedbackCategories.findIndex(
                (c) => c.id === +id
              )
            )
          ),
        },
      ],
    };
  }, [submission]);

  function handleSelectFactory(selectedOrigin: boolean) {
    return async ({ start, end }: Region) => {
      if (!submission) return;
      if (start === end) return;
      if (
        submission.feedbacks
          .filter((f) => f.selectedOrigin === selectedOrigin)
          .find(({ selectedIdx: { start: s, end: e } }) => s < end && start < e)
      ) {
        alert("중복된 영억을 선택할 수 없습니다.");
        return;
      }

      const newFeedback = await feedbackService.postOne({
        selectedIdx: { start, end },
        selectedOrigin,
        categoryIds: [],
        comment: "",
        professorId: user!.id,
        submissionId: submission.id,
        isTemporal: true,
      });
      dispatch({ type: "ADD_FEEDBACK", payload: newFeedback });
      setHighlightedRegions([
        { color: colorScheme("default"), start, end, selectedOrigin },
      ]);
      feedbackListRef.current?.scrollBy({
        behavior: "smooth",
        top: feedbackListRef.current.scrollHeight,
      });
    };
  }

  function handleMouseEnter({
    categories,
    selectedIdx,
    selectedOrigin,
  }: Feedback) {
    if (!submission) return;
    setHighlightedRegions([
      {
        color: getColor(categories),
        selectedOrigin,
        ...selectedIdx,
      },
    ]);
  }

  function handleMouseLeave() {
    setHighlightedRegions(
      submission?.feedbacks.map(
        ({ categories, selectedIdx, selectedOrigin }) => ({
          color: getColor(categories),

          selectedOrigin,
          ...selectedIdx,
        })
      ) ?? []
    );
  }

  async function handleCreateCategory(name: string) {
    const newCategory = await feedbackCategoryService.postOne({ name });
    dispatch({ type: "ADD_CATEGORY", payload: newCategory });
    return newCategory;
  }

  async function handleDelete(targetId: number) {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    dispatch({ type: "DELETE_FEEDBACK", payload: targetId });

    try {
      await feedbackService.deleteOne(targetId);
      alert("삭제되었습니다.");
    } catch (error) {
      alert(`에러가 발생하였습니다. ${error}`);
    }
  }

  async function handleSaveFeedback(
    targetId: number,
    comment: string,
    categoryIds: number[]
  ) {
    dispatch({
      type: "PUT_FEEDBACK",
      payload: { targetId, comment, categoryIds },
    });
    try {
      await feedbackService.putOne(targetId, { comment, categoryIds });
      alert("저장되었습니다.");
    } catch (error) {
      alert(`에러가 발생하였습니다. ${error}`);
    }
  }

  function getColor(categories: FeedbackCategory[]) {
    if (!submission) return "#000";
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
  }

  return submission ? (
    <main className="p-4 grid grid-rows-[auto_minmax(0,100%)] gap-2">
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
            submissionService.putOne({
              id: submission.id,
              generalReview: submission.generalReview,
              feedbackIds: submission.feedbacks.map((f) => f.id),
            });
          }}
        >
          저장
        </button>
      </nav>
      <section className="grid grid-cols-[1fr_20rem] gap-2">
        <section className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-2">
          <article className="flex flex-col">
            <h3>원문</h3>
            {submission.assignment.assignmentType !== "translate" && (
              <audio controls className="w-full"></audio>
            )}
            <Highlightable
              className="flex-grow"
              text={submission.assignment.textFile}
              highlightedRegions={highlightedRegions.filter(
                ({ selectedOrigin }) => selectedOrigin
              )}
              onSelect={handleSelectFactory(true)}
            />
          </article>
          <article className="flex flex-col">
            <h3>번역문</h3>
            {submission.assignment.assignmentType !== "translate" && (
              <audio controls className="w-full"></audio>
            )}
            <Highlightable
              className="flex-grow"
              text={submission.textFile}
              highlightedRegions={highlightedRegions.filter(
                ({ selectedOrigin }) => !selectedOrigin
              )}
              onSelect={handleSelectFactory(false)}
            />
          </article>
        </section>
        <section className="flex flex-col min-h-0">
          <h3>피드백</h3>
          <ul
            className="overflow-auto flex flex-col gap-2 hidden-scrollbar"
            ref={feedbackListRef}
          >
            {submission.feedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                selectedText={(feedback.selectedOrigin
                  ? submission.assignment.textFile
                  : submission.textFile
                ).slice(feedback.selectedIdx.start, feedback.selectedIdx.end)}
                backgroundColor={getColor(feedback.categories)}
                categories={submission.assignment.feedbackCategories}
                onMouseEnter={() => handleMouseEnter(feedback)}
                onMouseLeave={handleMouseLeave}
                onDelete={handleDelete}
                onSave={handleSaveFeedback}
                onCreateCategory={handleCreateCategory}
              />
            ))}
            <li className="p-4 border-2 rounded-md border-dashed border-primary flex flex-col items-center">
              <PlusIcon className="w-16 h-16 fill-primary" />
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
            value={submission.generalReview}
          ></textarea>
        </section>
        <section className="grid place-content-center">
          <Pie
            data={chartData}
            options={{
              font: {
                family: "'Noto Sans KR', 'sans-serif'",
              },
              aspectRatio: 2,
              plugins: { legend: { position: "right" } },
            }}
          ></Pie>
        </section>
      </section>
    </main>
  ) : (
    <span>Loading...</span>
  );
}

export default SubmissionWithFeedback;
