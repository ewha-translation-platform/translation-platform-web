import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "@/contexts";

function Header() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  function handleLogout() {
    setUser(null);
    navigate("/auth");
  }

  return (
    <header
      className={`col-span-full flex items-center gap-2 bg-primary p-2 text-white`}
    >
      <Link to="/" className="mr-auto">
        <h1 className="font-normal">Translation Platform</h1>
      </Link>
      <span className="hidden sm:inline">
        {user?.lastName}
        {user?.firstName}
        {user?.role === "PROFESSOR" ? " 교수" : ""}님 환영합니다!
      </span>
      <button
        className="btn-sm bg-white bg-opacity-30 hover:bg-opacity-20"
        onClick={handleLogout}
      >
        로그아웃
      </button>
    </header>
  );
}

export default Header;
