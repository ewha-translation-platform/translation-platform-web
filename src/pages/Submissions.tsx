import { SelectableTable } from "@/components";
import { assignmentService, submissionService } from "@/services";
import { CheckCircleIcon, XIcon } from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Switch from "react-switch";
import { toast } from "react-toastify";

function Submissions() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [submissionStatuses, setSubmissionStatuses] = useState<
    SubmissionStatus[]
  >([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [openAll, setOpenAll] = useState(false);

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

  function handleOpenOne(
    { studentId, submissionId, graded }: SubmissionStatus,
    v: boolean
  ) {
    if (!submissionId)
      return toast.warning("제출물이 없어 공개할 수 없습니다.");
    if (!graded) return toast.warning("채점 후 공개할 수 있습니다.");
    const old = submissionStatuses;
    setSubmissionStatuses((rows) =>
      rows.map((row) =>
        row.studentId === studentId ? { ...row, openedToStudent: v } : row
      )
    );
    submissionService
      .patchOne(submissionId, { openedToStudent: v })
      .then(() => {
        toast.success("성공적으로 변경하였습니다.");
      })
      .catch((err: Error) => {
        toast.error(err.message);
        setSubmissionStatuses(old);
      });
  }

  function handleOpenAll(v: boolean) {
    const old = submissionStatuses;
    const ids = old.reduce<number[]>(
      (acc, v) =>
        !!v.submissionId && v.graded ? [...acc, v.submissionId] : acc,
      []
    );
    if (ids.length === 0) {
      return toast.info("변경할 수 있는 항목이 없습니다.");
    }
    setOpenAll(v);
    setSubmissionStatuses((rows) =>
      rows.map((row) => ({
        ...row,
        openedToStudent: !!row.submissionId && row.graded && v,
      }))
    );
    submissionService
      .patchMany(ids, { openedToStudent: v })
      .then((count) => {
        toast.success(`${count} 개의 상태가 변경되었습니다.`);
      })
      .catch((err) => {
        toast.error(err.message);
        setOpenAll(!v);
        setSubmissionStatuses(old);
      });
  }

  return (
    <main className="space-y-4 p-4">
      <section className="flex justify-between">
        <h2>제출 목록</h2>
      </section>
      <section className="flex max-w-4xl flex-col items-start gap-4">
        {submissionStatuses && (
          <SelectableTable
            getSelected={(row) => selectedStudentIds.includes(row.studentId)}
            toggleSelect={handleToggle}
            labels={[
              "학번",
              "이름",
              "상태",
              "제출일시",
              "재생횟수",
              "채점",
              "공개여부",
            ]}
            columns={[
              "studentId",
              ({ lastName, firstName }) => `${lastName}${firstName}`,
              ({ submissionId }) => (submissionId === null ? "미제출" : "제출"),
              ({ submissionDateTime }) =>
                submissionDateTime
                  ? new Date(Date.parse(submissionDateTime)).toLocaleString()
                  : "",
              ({ playCount }) => (playCount ? `${playCount}회` : "해당없음"),
              ({ graded }) =>
                graded ? (
                  <div className="flex items-center justify-between font-semibold">
                    완료
                    <CheckCircleIcon className="h-8 w-8 stroke-green-600" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    미완료
                    <XIcon className="stroke-danger h-8 w-8" />
                  </div>
                ),
              (row) => (
                <label onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={row.openedToStudent}
                    onChange={(v) => {
                      handleOpenOne(row, v);
                    }}
                    checkedIcon={false}
                    uncheckedIcon={false}
                  ></Switch>
                </label>
              ),
            ]}
            data={submissionStatuses}
            onClick={({ submissionId }) =>
              submissionId
                ? navigate(`/submissions/${submissionId}`)
                : toast.error("제출물이 없어 이동할 수 없습니다.")
            }
          ></SelectableTable>
        )}
        <section className="flex justify-end gap-2 self-stretch">
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
          <label className="ml-auto flex cursor-pointer items-center gap-2">
            전체 공개
            <Switch
              checked={openAll}
              onChange={handleOpenAll}
              checkedIcon={false}
              uncheckedIcon={false}
            ></Switch>
          </label>
        </section>
      </section>
    </main>
  );
}

export default Submissions;
