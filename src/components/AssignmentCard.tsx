import { PencilIcon, TrashIcon } from "@heroicons/react/solid";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/contexts";
import Card from "./Card";

interface AssignmentCardProps {
  assignment: Assignment;
  displayActions: boolean;
  onDelete: () => void;
}

function AssignmentCard({
  assignment,
  displayActions,
  onDelete: handleDelete,
}: AssignmentCardProps) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(
      `/assignments/${assignment.id}/submissions${
        user?.role === "STUDENT" ? "/my" : ""
      }`
    );
  };

  return (
    <Card
      title={assignment.name}
      description={assignment.description}
      actions={
        displayActions && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${assignment.id}`);
              }}
            >
              <PencilIcon className="btn-icon fill-primary hover:bg-gray-200" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <TrashIcon className="btn-icon fill-danger hover:bg-gray-200" />
            </button>
          </>
        )
      }
      onClick={handleClick}
    ></Card>
  );
}

export default AssignmentCard;
