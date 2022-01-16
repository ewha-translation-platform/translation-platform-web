import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import UserContext from "../contexts/UserContext";
import userService from "../services/userService";

type Inputs = {
  id: number;
  password: string;
};

function Auth() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { register, handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    userService.getOne(0).then((user) => setUser(user));
    navigate("/");
  };

  return (
    <main className="container max-w-sm m-auto p-8 bg-gray-100 rounded-b-lg shadow-md flex flex-col gap-4 border-t-4 border-primary-base">
      <h2 className="text-2xl text-center text-primary font-semibold mb-4">
        로그인
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 justify-center"
      >
        <input
          type="text"
          inputMode="numeric"
          {...register("id")}
          placeholder="학번 / 교번"
          className="form-styling p-4"
        />
        <input
          type="password"
          {...register("password", { required: true })}
          placeholder="비밀번호"
          className="form-styling p-4"
        />
        <section className="flex gap-3">
          <input
            type="submit"
            value="로그인"
            className="btn btn-primary flex-grow"
          />
          <button className="btn btn-secondary">회원가입</button>
        </section>
        <button className="block text-lg font-semibold">
          비밀번호를 잊으셨나요?
        </button>
      </form>
      <section className="text-center">
        <p>
          회원이 아니신가요? <button>회원가입</button>
        </p>
      </section>
      <section className="flex flex-col gap-4">
        <div className="text-center">또는</div>
        <ul className="flex justify-evenly gap-1">
          {["Google", "Naver", "Kakao", "Apple"].map((e) => (
            <li key={e} className="btn bg-secondary">
              {e}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default Auth;
