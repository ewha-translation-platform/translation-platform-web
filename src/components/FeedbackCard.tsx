import { MouseEventHandler } from "react";
import { CreatableSelect, TextArea } from "./common";
import { XIcon } from "@heroicons/react/outline";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface FeedbackCardProps {
  feedback: Feedback;
  selectedText: string;
  backgroundColor: string;
  categories: FeedbackCategory[];
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
  onDelete: (id: number) => void;
  onChangeFeedback: (
    feedbackId: number,
    comment: string | null,
    categoryIds: number[]
  ) => Promise<void>;
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
  onChangeFeedback: handleChangeFeedback,
  onCreateCategory: handleCreateCategory,
}: FeedbackCardProps) {
  const {
    handleSubmit,
    register,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<{ comment: string }>({
    defaultValues: { comment: feedback.comment || "" },
  });
  const onSubmit: SubmitHandler<{ comment: string }> = async ({ comment }) => {
    await handleChangeFeedback(
      feedback.id,
      comment,
      feedback.categories.map(({ id }) => id)
    );
    reset({ comment });
    toast.success("코멘트가 적용되었습니다.");
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <li
      className={`relative flex max-w-full flex-col gap-2 p-3 shadow-md transition-shadow hover:shadow-none`}
      style={{ backgroundColor }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="bg-danger absolute top-0 right-0 h-6 w-6 rounded-bl-md p-1 text-white hover:bg-red-500"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(feedback.id);
        }}
      >
        <XIcon />
      </button>
      <p className="mt-3">{selectedText}</p>
      <CreatableSelect<Option<number>, true>
        value={categoryOptions.filter((c) =>
          feedback.categories.map(({ id }) => id).includes(c.value)
        )}
        onChange={async (newValue) => {
          await handleChangeFeedback(
            feedback.id,
            feedback.comment,
            newValue.map((v) => v.value)
          );
        }}
        onCreateOption={async (value) => {
          const { id: newId } = await handleCreateCategory(value);
          await handleChangeFeedback(feedback.id, feedback.comment, [
            ...feedback.categories.map(({ id }) => id),
            newId,
          ]);
        }}
        options={categoryOptions}
        placeholder="카테고리를 선택하세요"
        isMulti
        isSearchable
      />
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <TextArea
          label=""
          placeholder="코멘트를 입력하세요"
          innerClassName="resize-none"
          rows={3}
          {...register("comment")}
        ></TextArea>
        <button
          type="submit"
          className={`btn bg-primary text-white ${isDirty ? "" : "hidden"}`}
          disabled={isSubmitting}
        >
          적용
        </button>
      </form>
    </li>
  );
}

export default FeedbackCard;
