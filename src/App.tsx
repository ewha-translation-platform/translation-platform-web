import { useContext, useState } from "react";
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

function ProtectedWrapper() {
  const { user } = useContext(UserContext);
  return user ? (
    <div className="bg-neutral-100 h-screen grid sm:grid-cols-[var(--sidebar-width)_1fr] grid-rows-[auto_auto_minmax(0,100%)] sm:grid-rows-[auto_minmax(0,100%)]">
      <Header />
      <Sidebar />
      <Outlet />
    </div>
  ) : (
    <Navigate to="/auth" />
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/*" element={<ProtectedWrapper />}>
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
