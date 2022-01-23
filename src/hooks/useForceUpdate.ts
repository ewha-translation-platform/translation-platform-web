import { useReducer } from "react";

function useForceUpdate() {
  return useReducer((x) => !x, true)[1];
}

export default useForceUpdate;
