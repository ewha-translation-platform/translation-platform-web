import { useForm } from "react-hook-form";
import { InputField } from "./common";

interface CourseModalProps {
  visible: boolean;
  onSubmit: (code: string, name: string) => void;
  onCancel: () => void;
}
function CourseModal({ visible, onSubmit, onCancel }: CourseModalProps) {
  const { handleSubmit, register, reset } =
    useForm<{ code: string; name: string }>();
  return (
    <section
      className={`absolute top-0 left-0 z-20 h-full w-full bg-black bg-opacity-50 ${
        visible ? "grid" : "hidden"
      } place-content-center`}
    >
      <form
        className="w-md grid grid-cols-2 gap-2 rounded-md bg-white p-4 shadow-xl"
        onSubmit={handleSubmit(({ code, name }) => {
          onSubmit(code, name);
          reset();
        })}
      >
        <h2>강의 추가</h2>
        <InputField
          label="학수 번호"
          className="col-span-full"
          {...register("code")}
        ></InputField>
        <InputField
          label="강의 이름"
          className="col-span-full"
          {...register("name")}
        ></InputField>
        <button
          className="btn bg-secondary-500 text-white"
          onClick={(e) => {
            e.preventDefault();
            onCancel();
          }}
        >
          취소
        </button>
        <input
          className="btn bg-primary text-white"
          type="submit"
          value="확인"
        />
      </form>
    </section>
  );
}

export default CourseModal;
