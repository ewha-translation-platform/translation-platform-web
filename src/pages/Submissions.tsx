import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Table } from "@/components/common";
import { assignmentService } from "@/services";

function Submissions() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [submissionStatuses, setSubmissionStatuses] = useState<
    SubmissionStatus[]
  >([]);

  useEffect(() => {
    assignmentService
      .getSubmissionStatuses(+assignmentId!)
      .then((statuses) => setSubmissionStatuses(statuses));
  }, [assignmentId]);

  return (
    <main className="p-4 space-y-4">
      <h2>제출 목록</h2>
      <section className="overflow-y-auto">
        {submissionStatuses && (
          <Table
            labels={["학번", "이름", "상태", "제출일시", "채점", "횟수"]}
            columns={[
              "academicId",
              ({ lastName, firstName }) => `${lastName}${firstName}`,
              ({ submissionId }) => (submissionId === null ? "미제출" : "제출"),
              "submissionDateTime",
              ({ isGraded }) => (isGraded ? "완료" : "미완료"),
              ({ playCount }) => `${playCount}회`,
            ]}
            data={submissionStatuses}
            onClick={({ submissionId }) =>
              navigate(`/submissions/${submissionId}`)
            }
          ></Table>
        )}
      </section>
    </main>
  );
}

export default Submissions;
