import { PlusIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";

function NewItemCard() {
  return (
    <Link
      to="new"
      className="flex h-20 w-full items-center justify-center rounded-lg bg-primary hover:bg-opacity-80 sm:h-40 sm:w-40"
    >
      <PlusIcon className="h-12 w-12 text-white" />
    </Link>
  );
}

export default NewItemCard;
