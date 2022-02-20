import { SelectableTable } from "@/components";
import { assignmentService } from "@/services";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function Submissions() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [submissionStatuses, setSubmissionStatuses] = useState<
    SubmissionStatus[]
  >([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    assignmentService
      .getSubmissionStatuses(+assignmentId!)
      .then(setSubmissionStatuses);
  }, [assignmentId]);

  function handleToggle({ studentId }: SubmissionStatus) {
    setSelectedStudentIds((ids) => {
      if (ids.includes(studentId)) return ids.filter((id) => id !== studentId);
      else {
        if (ids.length === 2) return [studentId];
        else return [...ids, studentId];
      }
    });
  }

  return (
    <main className="space-y-4 p-4">
      <section className="flex justify-between">
        <h2>제출 목록</h2>
      </section>
      <section className="flex flex-col items-start gap-4">
        {submissionStatuses && (
          <SelectableTable
            getSelected={(row) => selectedStudentIds.includes(row.studentId)}
            toggleSelect={handleToggle}
            labels={["학번", "이름", "상태", "제출일시", "채점", "횟수"]}
            columns={[
              "studentId",
              ({ lastName, firstName }) => `${lastName}${firstName}`,
              ({ submissionId }) => (submissionId === null ? "미제출" : "제출"),
              ({ submissionDateTime }) =>
                submissionDateTime
                  ? new Date(Date.parse(submissionDateTime)).toLocaleString()
                  : "",
              ({ graded }) => (graded ? "완료" : "미완료"),
              ({ playCount }) => (playCount ? `${playCount}회` : "해당없음"),
            ]}
            data={submissionStatuses}
            onClick={({ submissionId }) =>
              submissionId
                ? navigate(`/submissions/${submissionId}`)
                : toast.error("제출물이 없어 이동할 수 없습니다.")
            }
          ></SelectableTable>
        )}
        <button
          className="btn bg-primary text-white"
          disabled={selectedStudentIds.length !== 2}
          onClick={() => {
            const arr = submissionStatuses
              .map((s) => s.studentId)
              .filter((id) => selectedStudentIds.includes(id));
            toast.info(`compare ${arr}`);
          }}
        >
          비교
        </button>
      </section>
    </main>
  );
}

export default Submissions;
