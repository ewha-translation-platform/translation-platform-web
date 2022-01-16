import { PlusIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";

function NewItemCard() {
  return (
    <Link
      to="new"
      className="w-full h-20 sm:w-40 sm:h-40 bg-primary hover:bg-opacity-80 rounded-lg flex justify-center items-center"
    >
      <PlusIcon className="text-white w-12 h-12" />
    </Link>
  );
}

export default NewItemCard;
