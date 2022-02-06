import { GroupBase, StylesConfig } from "react-select";
import Creatable, { CreatableProps } from "react-select/creatable";

interface CreatableSelectProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
> extends CreatableProps<Option, IsMulti, Group> {
  label: string;
  className?: string;
}

function CreatableSelect<
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  label,
  className = "",
  ...props
}: CreatableSelectProps<Option, IsMulti, Group>) {
  const styles: StylesConfig<Option, IsMulti, Group> = {
    control: (base) => ({
      ...base,
      padding: 0,
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
    container: (base) => ({
      ...base,
      padding: 0,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0.5rem",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    indicatorSeparator: () => ({}),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0.5rem",
      color: "black",
    }),
  };

  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      {label}
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
        styles={styles}
      ></Creatable>
    </label>
  );
}

export default CreatableSelect;
