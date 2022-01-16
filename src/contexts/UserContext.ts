import { createContext, Dispatch, SetStateAction } from "react";

const UserContext = createContext<{
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}>({ user: null, setUser: () => {} });

export default UserContext;
