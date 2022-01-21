import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table } from "@/components/common";
import { classService } from "@/services";

function Students() {
  const { classId } = useParams<{ classId: string }>();
  const [classInfo, setClassInfo] = useState<Class | null>();

  useEffect(() => {
    classService.getOne(+classId!).then((data) => {
      setClassInfo(data);
    });
  }, [classId]);

  return (
    <main className="p-4">
      <h2>수강생 목록</h2>
      {classInfo && (
        <Table
          labels={["학번", "단과대학", "학과", "이름"]}
          columns={["academicId", "collegeName", "departmentName", "lastName"]}
          data={classInfo.students}
        ></Table>
      )}
    </main>
  );
}

export default Students;
