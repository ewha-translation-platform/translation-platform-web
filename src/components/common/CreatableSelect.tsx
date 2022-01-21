import { GroupBase } from "react-select";
import Creatable, { CreatableProps } from "react-select/creatable";

function CreatableSelect<
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: CreatableProps<Option, IsMulti, Group>) {
  return (
    <Creatable<Option, IsMulti, Group>
      {...props}
      formatCreateLabel={(inputValue) => `"${inputValue}" 추가`}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: "#00462A4D",
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
