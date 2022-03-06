import { createContext, Dispatch, SetStateAction } from "react";

interface GlobalUser {
  id: string;
  role: Role;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
}

const UserContext = createContext<{
  user: GlobalUser | null;
  setUser: Dispatch<SetStateAction<GlobalUser | null>>;
}>({ user: null, setUser: () => {} });

export default UserContext;
