import chroma from "chroma-js";
import { GroupBase } from "react-select";
import Creatable, { CreatableProps } from "react-select/creatable";
import colorScheme from "../../utils/colorScheme";

function CreatableSelect(
  props: CreatableProps<
    { value: number; label: string },
    boolean,
    GroupBase<{ value: number; label: string }>
  >
) {
  return (
    <Creatable
      {...props}
      formatCreateLabel={(inputValue) => `"${inputValue}" 추가`}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: "rgba(0, 70, 42, 30%)",
          primary: "#00462A",
        },
      })}
      styles={{
        control: (base) => ({
          ...base,
          padding: "0.25rem",
          border: "1px solid #00462A",
          borderRadius: "0.375rem",
          ":hover": {
            border: "1px solid #00462A",
            cursor: "text",
          },
          ":focus": {
            outline: "none",
          },
        }),
      }}
    ></Creatable>
  );
}

export default CreatableSelect;
