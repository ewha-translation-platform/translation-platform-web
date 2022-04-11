import { MouseEventHandler } from "react";
import { CreatableSelect, TextArea } from "./common";
import { XIcon } from "@heroicons/react/outline";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import chroma from "chroma-js";

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
    toast.success("코멘트가 저장되었습니다.");
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <li
      className={`max-w-full border bg-white shadow-md transition-shadow hover:shadow-none`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <section style={{ backgroundColor }} className="flex justify-end">
        <button
          className="h-6 w-6 rounded-bl-md bg-danger p-1 text-white hover:bg-red-500"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(feedback.id);
          }}
        >
          <XIcon />
        </button>
      </section>
      <section
        className="flex flex-col gap-2 p-3"
        style={{ backgroundColor: chroma(backgroundColor).alpha(0.3).hex() }}
      >
        <p>{selectedText}</p>
        <CreatableSelect<Option<number>, true>
          label=""
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
          maxMenuHeight={200}
        />
        <form className="flex flex-col gap-1" onSubmit={handleSubmit(onSubmit)}>
          <TextArea
            label=""
            placeholder="코멘트를 입력하세요"
            innerClassName="resize-none"
            rows={1}
            {...register("comment")}
          ></TextArea>
          {isDirty && (
            <div className="flex items-center justify-between">
              <span className="text-red-700">
                코멘트가 저장되지 않았습니다.
              </span>
              <button
                type="submit"
                className="btn-sm rounded-md bg-primary text-white"
                disabled={isSubmitting}
              >
                저장
              </button>
            </div>
          )}
        </form>
      </section>
    </li>
  );
}

export default FeedbackCard;
