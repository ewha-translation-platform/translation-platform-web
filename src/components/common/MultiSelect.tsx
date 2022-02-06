import Select, { Props, StylesConfig } from "react-select";
interface MultiSelectProps<Option> extends Props<Option, true> {
  label: string;
  className?: string;
}

function MultiSelect<Option>({
  label,
  className,
  ...props
}: MultiSelectProps<Option>) {
  const styles: StylesConfig<Option, true> = {
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
        styles={styles}
        {...props}
      ></Select>
    </label>
  );
}

export default MultiSelect;
