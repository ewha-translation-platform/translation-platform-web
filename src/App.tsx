import { Header, Sidebar } from "@/components";
import { UserContext } from "@/contexts";
import {
  AssignmentForm,
  Assignments,
  Auth,
  Classes,
  ClassForm,
  Home,
  Register,
  Students,
  Submission,
  Submissions,
  SubmissionWithFeedback,
} from "@/pages";
import { authService } from "@/services";
import { setAccessToken } from "@/utils";
import jwtDecode from "jwt-decode";
import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

function ProtectedWrapper() {
  const { user } = useContext(UserContext);

  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="grid h-screen grid-rows-[auto_auto_minmax(0,100%)] bg-neutral-100 sm:grid-cols-[var(--sidebar-width)_1fr] sm:grid-rows-[auto_minmax(0,100%)]">
      <Header />
      <Sidebar />
      <Outlet />
    </div>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .refreshToken()
      .then((accessToken) => {
        setAccessToken(accessToken);
        setUser(jwtDecode(accessToken));
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
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
      <ToastContainer />
    </UserContext.Provider>
  );
}

export default App;
