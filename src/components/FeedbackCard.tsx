import { MouseEventHandler, useState } from "react";
import { CreatableSelect, TextArea } from "./common";
import { XIcon } from "@heroicons/react/outline";

interface FeedbackCardProps {
  readonly feedback: Feedback;
  selectedText: string;
  backgroundColor: string;
  categories: FeedbackCategory[];
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
  onDelete: (id: number) => void;
  onSave: (
    targetId: number,
    comment: string | null,
    categoryIds: number[]
  ) => void;
  onCreateCategory: (name: string) => Promise<FeedbackCategory>;
}

function FeedbackCard({
  feedback,
  selectedText,
  backgroundColor,
  categories,
  onMouseEnter: handleMouseEnter = () => {},
  onMouseLeave: handleMouseLeave = () => {},
  onDelete: handleDelete,
  onSave: handleSave,
  onCreateCategory: handleCreateCategory,
}: FeedbackCardProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [comment, setComment] = useState(feedback.comment);
  const [categoryIds, setCategoryIds] = useState<number[]>(
    feedback.categories.map((c) => c.id)
  );

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <li
      className={`relative flex flex-col gap-2 rounded-md shadow-md p-4 hover:cursor-pointer hover:shadow-none transition-shadow overflow-hidden`}
      style={{ backgroundColor }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="absolute top-0 right-0 h-8 w-8 p-1 rounded-bl-lg bg-danger text-white hover:bg-red-500"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(feedback.id);
        }}
      >
        <XIcon />
      </button>
      <p>{selectedText}</p>
      <TextArea
        label="코멘트"
        innerClassName="resize-none"
        rows={2}
        value={comment || ""}
        onChange={(e) => {
          setIsDirty(true);
          setComment(e.target.value);
        }}
      ></TextArea>
      <CreatableSelect<Option<number>, true>
        value={categoryOptions.filter((c) => categoryIds.includes(c.value))}
        onChange={(newValue) => {
          setIsDirty(true);
          setCategoryIds(newValue.map((v) => v.value));
        }}
        onCreateOption={async (value) => {
          const { id: newId } = await handleCreateCategory(value);
          setCategoryIds((ids) => [...ids, newId]);
          setIsDirty(true);
        }}
        options={categoryOptions}
        classNamePrefix="react-select"
        isMulti
        isSearchable
      />
      <section className="flex items-center justify-end gap-2">
        {isDirty && (
          <button
            className="btn bg-primary text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleSave(feedback.id, comment, categoryIds);
              setIsDirty(false);
            }}
          >
            저장
          </button>
        )}
      </section>
    </li>
  );
}

export default FeedbackCard;
