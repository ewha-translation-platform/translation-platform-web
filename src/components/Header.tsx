import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";

import UserContext from "../contexts/UserContext";

function Header() {
  const { user, setUser } = useContext(UserContext);

  return (
    <header
      className={`z-10 p-2 h-navbar flex gap-2 items-center bg-primary text-white transition-all sm:fixed sm:w-full sm:p-4`}
    >
      <Link to="/" className="mr-auto">
        <h1 className="font-normal">Translation Platform</h1>
      </Link>
      <span className="hidden sm:inline">
        {user?.lastName}
        {user?.firstName}님 환영합니다!
      </span>
      <button
        className="btn-sm bg-neutral-300 text-black"
        onClick={() =>
          setUser({
            ...user!,
            role: user!.role === "professor" ? "student" : "professor",
          })
        }
      >
        {user?.role === "professor" ? "교수용" : "학생용"}
      </button>
      {!user ? (
        <NavLink to="/auth" className="btn-sm bg-neutral-300 text-black">
          로그인
        </NavLink>
      ) : (
        <button
          className="btn-sm bg-neutral-300 text-black"
          onClick={() => setUser(null)}
        >
          로그아웃
        </button>
      )}
    </header>
  );
}

export default Header;
