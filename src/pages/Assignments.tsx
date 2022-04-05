import { useContext, useEffect, useState } from "react";
import { AssignmentCard, NewItemCard } from "../components";
import { UserContext } from "@/contexts";
import { assignmentService, classService } from "@/services";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

function Assignments() {
  const currentWeek = 0;
  const { classId } = useParams<{ classId: string }>();
  const { user } = useContext(UserContext);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const assignmentsByWeekNumber = [...Array(16)].map((_, idx) =>
    assignments.filter(({ weekNumber }) => weekNumber === idx + 1)
  );

  useEffect(() => {
    classService.getAssignments(+classId!).then(setAssignments);
  }, [classId]);

  function handleDelete(targetId: number) {
    const olds = assignments;
    setAssignments(assignments.filter((item) => item.id !== targetId));
    assignmentService
      .deleteOne(targetId)
      .then(() => toast.success("삭제되었습니다."))
      .catch(() => {
        toast.error("실패했습니다.");
        setAssignments(olds);
      });
  }

  return (
    <main className="space-y-4 overflow-auto p-4">
      <h2>과제 목록</h2>
      <section className="space-y-4 rounded-md bg-secondary-300 p-4 shadow-inner">
        <h3>현재 주차</h3>
        <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          {assignmentsByWeekNumber[currentWeek].length === 0
            ? "과제가 없습니다."
            : assignmentsByWeekNumber[currentWeek].map((item) => (
                <AssignmentCard
                  key={item.id}
                  assignment={item}
                  displayActions={user?.role === "PROFESSOR"}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
          {user?.role === "PROFESSOR" && <NewItemCard />}
        </ul>
      </section>
      {assignmentsByWeekNumber.map((assignments, idx) => (
        <section key={idx} className="space-y-4">
          <h3>{idx + 1}주차</h3>
          <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            {assignments.length === 0
              ? "과제가 없습니다."
              : assignments.map((item) => (
                  <AssignmentCard
                    key={item.id}
                    assignment={item}
                    displayActions={user?.role === "PROFESSOR"}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

export default Assignments;
