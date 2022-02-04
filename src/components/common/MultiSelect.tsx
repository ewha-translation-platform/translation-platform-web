import Select, { Props } from "react-select";

function MultiSelect<Option>(props: Props<Option, true>) {
  return (
    <Select<Option, true>
      isMulti
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
      {...props}
    ></Select>
  );
}

export default MultiSelect;
