import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { InputField } from "@/components/common";
import { UserContext } from "@/contexts";
import { userService } from "@/services";

type Fields = {
  id: number;
  password: string;
};

function Auth() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { register, handleSubmit } = useForm<Fields>();
  const onSubmit: SubmitHandler<Fields> = (data) => {
    alert("개발 모드에서는 지원하지 않습니다.");
  };

  async function devAuth(isProfessor: boolean) {
    if (isProfessor) {
      const prof = await userService.getOne(0);
      setUser(prof);
    } else {
      const student = await userService.getOne(1);
      setUser(student);
    }
    navigate("/");
  }

  return (
    <div className="h-screen grid place-content-center">
      <main className="max-w-sm p-8 pt-8 bg-gray-100 rounded-b-lg shadow-md border-t-4 border-primary flex flex-col gap-8">
        <h2 className="text-center font-semibold">로그인 - Dev</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <InputField
            label="학번 / 교번"
            type="text"
            inputMode="numeric"
            {...register("id")}
            disabled
          />
          <InputField
            label="비밀번호"
            type="password"
            {...register("password", { required: true })}
            disabled
          />
          <section className="flex justify-evenly gap-2">
            <button
              onClick={() => devAuth(true)}
              className="btn bg-primary text-white hover:bg-opacity-70"
            >
              교수용 로그인
            </button>
            <button
              onClick={() => devAuth(false)}
              className="btn bg-secondary-500 text-white hover:bg-opacity-70"
            >
              학생용 로그인
            </button>
          </section>
          {/* <section className="flex gap-2">
            <input
              type="submit"
              value="로그인"
              className="flex-grow btn bg-primary text-white"
            />
            <button className="btn bg-secondary-500 text-white">
              회원가입
            </button>
          </section> */}
          <button className="text-blue-500 underline font-semibold" disabled>
            비밀번호를 잊으셨나요?
          </button>
        </form>
        <section>
          <p className="text-center">소셜 계정으로 로그인</p>
          <ul className="flex justify-evenly gap-1">
            {["Google", "Naver", "Kakao", "Apple"].map((e) => (
              <li key={e}>
                <button className="btn bg-secondary-500 text-white" disabled>
                  {e}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Auth;
