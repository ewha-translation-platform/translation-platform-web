import { MouseEventHandler, useState } from "react";
import colorScheme from "../utils/colorScheme";
import CreatableSelect from "./common/CreatableSelect";
import TextArea from "./common/TextArea";

interface FeedbackCardProps {
  readonly feedback: Feedback;
  selectedText: string;
  categories: FeedbackCategory[];
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
  onDelete: (id: number) => void;
  onSave: (targetId: number, comment: string, categoryIds: number[]) => void;
  onCreateCategory: (name: string) => Promise<FeedbackCategory>;
}

function FeedbackCard({
  feedback,
  selectedText,
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

  return (
    <li
      className={`snap-start flex flex-col gap-2 rounded-md shadow-md p-4 hover:cursor-pointer hover:shadow-none transition-shadow`}
      style={{
        backgroundColor: colorScheme[categoryIds[0] % colorScheme.length],
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <p>{selectedText}</p>
      <TextArea
        label="코멘트"
        innerClassName="resize-none"
        rows={2}
        value={comment}
        onChange={(e) => {
          setIsDirty(true);
          setComment(e.target.value);
        }}
      ></TextArea>
      <CreatableSelect
        value={categories
          .filter((c) => c.id in categoryIds)
          .map((c) => ({ value: c.id, label: c.name }))}
        onChange={(newValue) => {
          setIsDirty(true);
          setCategoryIds(
            Array.isArray(newValue)
              ? newValue.map((v) => v.value)
              : [(newValue as { value: number; label: string }).value]
          );
        }}
        onCreateOption={async (value) => {
          const { id: newId } = await handleCreateCategory(value);
          setCategoryIds((ids) => [...ids, newId]);
        }}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        classNamePrefix="react-select"
        isMulti
        isSearchable
      />
      <section className="flex items-center justify-end gap-2">
        <button
          className="btn bg-danger text-white"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(feedback.id);
          }}
        >
          삭제
        </button>
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
