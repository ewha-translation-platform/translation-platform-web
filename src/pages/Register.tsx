import { InputField, Select } from "@/components/common";
import { authService, departmentService } from "@/services";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<CreateUserDto>({
    defaultValues: { role: "STUDENT" },
  });

  useEffect(() => {
    departmentService.getAll().then((departments) => {
      setDepartments(departments);
      setValue("departmentId", departments[0].id);
    });
  }, [setValue]);

  const onSubmit: SubmitHandler<CreateUserDto> = (data) => {
    authService
      .register(data)
      .then(() => navigate("/classes"))
      .catch((err) => {
        if (err instanceof Error) {
          toast.error(err.message);
        }
      });
  };

  return (
    <div className="grid h-screen place-content-center">
      <main className="border-primary flex max-w-sm flex-col gap-8 rounded-b-lg border-t-4 bg-gray-100 p-8 pt-8 shadow-md">
        <h2 className="text-center">회원가입</h2>
        <form
          className="grid grid-cols-2 gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputField
            label="이메일"
            type="email"
            className="col-span-full"
            required
            {...register("email")}
          />
          <InputField
            label="비밀번호"
            type="password"
            className="col-span-full"
            required
            {...register("password")}
          />
          <InputField
            label="성"
            type="text"
            required
            {...register("lastName")}
          />
          <InputField
            label="이름"
            type="text"
            required
            {...register("firstName")}
          />
          <Select<number>
            label="학과"
            options={departments.map(({ id, name }) => ({
              value: id,
              label: name,
            }))}
            required
            className="col-span-full"
            {...register("departmentId", { valueAsNumber: true })}
          ></Select>
          <Select<Role>
            label="분류"
            options={[
              { label: "교수", value: "PROFESSOR" },
              { label: "학생", value: "STUDENT" },
              { label: "조교", value: "ASSISTANT" },
            ]}
            required
            className="col-span-full"
            {...register("role")}
          ></Select>
          <button
            className="btn mt-2 bg-neutral-400 text-white"
            onClick={(e) => {
              e.preventDefault();
              navigate("..");
            }}
          >
            취소
          </button>
          <button type="submit" className="btn bg-primary mt-2  text-white">
            가입
          </button>
        </form>
      </main>
    </div>
  );
}

export default Register;
