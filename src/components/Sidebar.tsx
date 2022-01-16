import { NavLink } from "react-router-dom";

function StyledNavLink(props: { to: string; label: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        `text-lg hover:bg-white hover:bg-opacity-20 px-4 py-2 ${
          isActive ? "bg-white bg-opacity-20" : ""
        }`
      }
    >
      {props.label}
    </NavLink>
  );
}

function Sidebar() {
  // const { user } = useContext(UserContext);

  return (
    <nav
      className={`fixed top-0 left-0 h-screen pt-navbar sm:w-sidebar flex sm:flex-col bg-secondary-800 text-white`}
    >
      {/* <StyledNavLink to="home" label="홈" /> */}
      <StyledNavLink to="classes" label="강의 목록" />
      {/* {user?.role === "student" ? (
        <StyledNavLink to="submissions" label="제출물 목록" />
      ) : (
        <StyledNavLink to="feedbacks" label="피드백 목록" />
      )} */}
    </nav>
  );
}

export default Sidebar;
