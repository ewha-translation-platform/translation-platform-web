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
      className={`z-20 absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 ${
        visible ? "grid" : "hidden"
      } place-content-center`}
    >
      <form
        className="w-md bg-white p-4 rounded-md shadow-xl grid grid-cols-2 gap-2"
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
