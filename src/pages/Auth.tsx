import { InputField } from "@/components/common";
import { UserContext } from "@/contexts";
import { authService } from "@/services";
import decode from "jwt-decode";
import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type Fields = {
  email: string;
  password: string;
};

function Auth() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { register, handleSubmit } = useForm<Fields>();
  const onSubmit: SubmitHandler<Fields> = async (data) => {
    try {
      const accessToken = await authService.login(data.email, data.password);
      const { id, role, isAdmin, firstName, lastName } =
        decode<any>(accessToken);
      setUser({ id, role, isAdmin, firstName, lastName });
      navigate("/");
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  return (
    <div className="grid h-screen place-content-center">
      <main className="border-primary flex max-w-sm flex-col gap-8 rounded-b-lg border-t-4 bg-gray-100 p-8 pt-8 shadow-md">
        <h2 className="text-center font-semibold">로그인</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <InputField label="이메일" type="email" {...register("email")} />
          <InputField
            label="비밀번호"
            type="password"
            {...register("password", { required: true })}
          />
          <section className="flex gap-2">
            <input
              type="submit"
              value="로그인"
              className="btn bg-primary flex-grow text-white"
            />
            <button
              className="btn bg-secondary-500 text-white"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
            >
              회원가입
            </button>
          </section>
          <button className="font-semibold text-blue-500 underline" disabled>
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
