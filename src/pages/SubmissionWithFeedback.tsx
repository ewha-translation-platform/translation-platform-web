import { PlusIcon } from "@heroicons/react/solid";
import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { useContext, useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import FeedbackCard from "../components/FeedbackCard";
import Highlightable from "../components/Highlightable";
import UserContext from "../contexts/UserContext";
import {
  feedbackCategoryService,
  feedbackService,
} from "../services/feedbackService";
import submissionService from "../services/submissionService";
import colorScheme from "../utils/colorScheme";

Chart.register(ArcElement, Tooltip, Legend);

function SubmissionWithFeedback() {
  const { user } = useContext(UserContext);
  const { submissionId } = useParams<{ submissionId: string }>();

  const [submission, setSubmission] = useState<Submission>();

  const [highlightedIdxs, setHighlightedIdxs] = useState<
    { color: number; start: number; end: number }[]
  >([]);

  useEffect(() => {
    submissionService.getOne(+submissionId!).then((submission) => {
      setSubmission(submission);
      setHighlightedIdxs(
        submission.feedbacks.map(({ categories, selectedIdx }) => ({
          color: categories[0].id,
          ...selectedIdx,
        }))
      );
    });
  }, [submissionId]);

  const chartData = useMemo(() => {
    const data = submission?.assignment.feedbackCategories.map(
      (item) =>
        submission.feedbacks.filter((s) =>
          s.categories.some(({ id }) => id === item.id)
        ).length
    );
    return {
      labels:
        submission?.assignment.feedbackCategories.map((c) => c.name) || [],
      datasets: [
        {
          label: "피드백 카테고리",
          data: data || [],
          backgroundColor: colorScheme,
        },
      ],
    };
  }, [submission]);

  async function handleSelect(selectedIdx: Region) {
    if (!submission) return;
    if (selectedIdx.start < selectedIdx.end) {
      const newFeedback = await feedbackService.postOne({
        selectedIdx,
        categoryIds: [0],
        comment: "",
        professorId: user!.id,
        submissionId: submission.id,
      });
      setSubmission(
        (submission) =>
          submission && {
            ...submission,
            feedbacks: [...submission.feedbacks, newFeedback],
          }
      );
    }
  }

  function handleMouseEnter({ categories, selectedIdx }: Feedback) {
    setHighlightedIdxs([{ color: categories[0].id, ...selectedIdx }]);
  }

  function handleMouseLeave() {
    setHighlightedIdxs(
      submission?.feedbacks.map(({ categories, selectedIdx }) => ({
        color: categories[0].id,
        ...selectedIdx,
      })) || []
    );
  }

  async function handleCreateCategory(name: string) {
    const newCategory = await feedbackCategoryService.postOne({ name });
    setSubmission(
      (submission) =>
        submission && {
          ...submission,
          assignment: {
            ...submission.assignment,
            feedbackCategories: [
              ...submission.assignment.feedbackCategories,
              newCategory,
            ],
          },
        }
    );
    return newCategory;
  }

  function handleDelete(targetId: number) {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setSubmission(
      (submission) =>
        submission && {
          ...submission,
          feedbacks: submission.feedbacks.filter((f) => f.id !== targetId),
        }
    );
    feedbackService
      .deleteOne(targetId)
      .then(() => alert("삭제되었습니다."))
      .catch((e) => alert(`에러가 발생하였습니다. ${e}`));
  }

  function handleSaveFeedback(
    targetId: number,
    comment: string,
    categoryIds: number[]
  ) {
    setSubmission(
      (submission) =>
        submission && {
          ...submission,
          feedbacks: submission.feedbacks.map((f) =>
            f.id === targetId
              ? {
                  ...f,
                  comment,
                  categories: submission.assignment.feedbackCategories.filter(
                    (c) => c.id in categoryIds
                  ),
                }
              : f
          ),
        }
    );
    feedbackService
      .putOne(targetId, { comment, categoryIds })
      .then(() => alert("저장되었습니다."))
      .catch((e) => alert(`에러가 발생하였습니다. ${e}`));
  }

  return submission ? (
    <main className="p-4">
      <nav className="h-navbar flex items-start gap-2">
        <h2 className="flex-grow">
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
          onClick={(e) => {
            e.preventDefault();
            submissionService.putOne(submission.id, {
              feedbackIds: submission.feedbacks.map((f) => f.id),
              generalReview: submission.generalReview,
            });
          }}
        >
          저장
        </button>
      </nav>
      <section className="h-[calc(100vh-2*var(--navbar-height)-2rem)] grid grid-rows-[minmax(0,1fr)_min-content] grid-cols-[auto_400px] gap-4">
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <article className="flex flex-col">
            <h3>원문</h3>
            {submission.assignment.assignmentType !== "translate" && (
              <audio controls className="w-full"></audio>
            )}
            <textarea
              className="flex-grow w-full resize-none"
              readOnly
              value={submission.assignment.textFile}
            ></textarea>
          </article>
          <article className="flex flex-col">
            <h3>번역문</h3>
            {submission.assignment.assignmentType !== "translate" && (
              <audio controls className="w-full"></audio>
            )}
            <Highlightable
              className="flex-grow"
              text={submission.textFile}
              highlightedIdxs={highlightedIdxs}
              onSelect={handleSelect}
            />
          </article>
        </section>
        <section className="flex flex-col">
          <h3>피드백</h3>
          <ul className="overflow-auto snap-y snap-mandatory flex flex-col gap-2 hidden-scrollbar">
            {submission.feedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                selectedText={submission.textFile.slice(
                  feedback.selectedIdx.start,
                  feedback.selectedIdx.end
                )}
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
              setSubmission(
                submission && {
                  ...submission,
                  generalReview: e.target.value,
                }
              )
            }
            value={submission.generalReview}
          ></textarea>
        </section>
        <section className="p-4">
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
