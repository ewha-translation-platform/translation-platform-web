import { PencilIcon, TrashIcon, UserIcon } from "@heroicons/react/solid";
import { useNavigate } from "react-router-dom";
import Card from "./Card";

interface ClassCardProps {
  classInfo: Class;
  displayActions: boolean;
  onDelete: () => void;
}

function ClassCard({
  classInfo,
  displayActions,
  onDelete: handleDelete,
}: ClassCardProps) {
  const navigate = useNavigate();
  return (
    <Card
      title={classInfo.course.name}
      subtitle={`${classInfo.course.code} ${classInfo.classNumber}분반`}
      description={`개설학과: ${classInfo.course.department.name}`}
      actions={
        displayActions && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${classInfo.id}/students`);
              }}
            >
              <UserIcon className="btn-icon fill-primary hover:bg-gray-200" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${classInfo.id}`);
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
      onClick={() => navigate(`${classInfo.id}/assignments`)}
    ></Card>
  );
}

export default ClassCard;
