import { useLayoutEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Header, Sidebar } from "@/components";
import { UserContext } from "@/contexts";
import {
  AssignmentForm,
  Assignments,
  Auth,
  Classes,
  ClassForm,
  Home,
  Students,
  Submission,
  Submissions,
  SubmissionWithFeedback,
} from "@/pages";
import { userService } from "@/services";

function Wrapper() {
  return (
    <>
      <Header />
      <Sidebar />
      <div className="hidden-scrollbar sm:pt-navbar sm:pl-sidebar sm:overflow-auto">
        <Outlet />
      </div>
    </>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  useLayoutEffect(() => {
    userService.getOne(0).then((user) => setUser(user));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/*" element={<Wrapper />}>
          <Route path="home" element={<Home />} />
          <Route path="classes">
            <Route index element={<Classes />} />
            <Route path=":classId">
              <Route index element={<ClassForm />} />
              <Route path="students" element={<Students />} />
              <Route path="assignments">
                <Route index element={<Assignments />} />
                <Route path=":assignmentId" element={<AssignmentForm />} />
              </Route>
            </Route>
          </Route>
          <Route path="assignments">
            <Route path=":assignmentId">
              <Route index element={<AssignmentForm />} />
              <Route path="submissions">
                <Route index element={<Submissions />} />
                <Route path="my" element={<Submission />} />
              </Route>
            </Route>
          </Route>
          <Route
            path="submissions/:submissionId"
            element={<SubmissionWithFeedback />}
          />
          <Route index element={<Navigate to="/classes" replace />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
}

export default App;
