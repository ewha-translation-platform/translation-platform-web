import { Table } from "@/components/common";
import { classService } from "@/services";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

function Students() {
  const { classId } = useParams<{ classId: string }>();
  const [students, setStudents] = useState<User[]>();

  useEffect(() => {
    classService.getStudents(+classId!).then(setStudents);
  }, [classId]);

  return (
    <main className="space-y-4 p-4">
      <h2>수강생 목록</h2>
      {students && (
        <Table
          labels={["학번", "단과대학", "학과", "이름"]}
          columns={[
            "id",
            "college",
            "department",
            ({ firstName, lastName }) => `${lastName}${firstName}`,
          ]}
          data={students}
        ></Table>
      )}
      <button
        className="btn bg-primary text-white"
        onClick={async (e) => {
          const studentId = window.prompt("추가할 수강생의 학번을 입력하세요");
          if (studentId) {
            const { ok } = await classService.addStudent(+classId!, studentId);
            if (ok) {
              toast.success("수강생을 추가하였습니다.");
            } else {
              toast.error("오류가 발생하였습니다.");
            }
          }
        }}
      >
        수강생 추가
      </button>
    </main>
  );
}

export default Students;
