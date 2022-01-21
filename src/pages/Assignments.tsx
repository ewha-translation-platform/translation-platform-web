import { useContext, useEffect, useState } from "react";
import { AssignmentCard, NewItemCard } from "../components";
import { UserContext } from "@/contexts";
import { assignmentService } from "@/services";

function Assignments() {
  const currentWeek = 0;
  const { user } = useContext(UserContext);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const assignmentsByWeekNumber = [...Array(16)].map((_, idx) =>
    assignments.filter(({ weekNumber }) => weekNumber === idx + 1)
  );

  useEffect(() => {
    assignmentService.getAll().then((data) => setAssignments(data));
  }, []);

  function handleDelete(targetId: number) {
    setAssignments(assignments.filter(({ id }) => id !== targetId));
    assignmentService.deleteOne(targetId);
  }

  return (
    <main className="p-4 space-y-4">
      <h2>과제 목록</h2>
      <section className="p-4 space-y-4 bg-secondary-300 rounded-md shadow-inner">
        <h3>현재 주차</h3>
        <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
          {assignmentsByWeekNumber[currentWeek].length === 0
            ? "과제가 없습니다."
            : assignmentsByWeekNumber[currentWeek].map((item) => (
                <AssignmentCard
                  key={item.id}
                  assignment={item}
                  displayActions={user?.role === "professor"}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
          {user?.role === "professor" && <NewItemCard />}
        </ul>
      </section>
      {assignmentsByWeekNumber.map((assignments, idx) => (
        <section key={idx} className="space-y-4">
          <h3>{idx + 1}주차</h3>
          <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
            {assignments.length === 0
              ? "과제가 없습니다."
              : assignments.map((item) => (
                  <AssignmentCard
                    key={item.id}
                    assignment={item}
                    displayActions={user?.role === "professor"}
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
