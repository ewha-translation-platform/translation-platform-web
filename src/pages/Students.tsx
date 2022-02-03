import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table } from "@/components/common";
import { classService } from "@/services";

function Students() {
  const { classId } = useParams<{ classId: string }>();
  const [students, setStudents] = useState<User[]>();

  useEffect(() => {
    classService.getStudents(+classId!).then(setStudents);
  }, [classId]);

  return (
    <main className="p-4">
      <h2>수강생 목록</h2>
      {students && (
        <Table
          labels={["학번", "단과대학", "학과", "이름"]}
          columns={["id", "college", "department", "lastName"]}
          data={students}
        ></Table>
      )}
    </main>
  );
}

export default Students;
