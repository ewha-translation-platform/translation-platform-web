import { DetailedHTMLProps, forwardRef, SelectHTMLAttributes } from "react";

export const yearOptions: Option[] = [
  { label: "전체", value: "0" },
  { label: "2022", value: "2022" },
];
export const semesterOptions: Option[] = [
  { label: "전체", value: "" },
  { label: "1학기", value: "spring" },
  { label: "2학기", value: "fall" },
  { label: "여름학기", value: "summer" },
  { label: "겨울학기", value: "winter" },
];

export interface Option {
  label: string;
  value: string | number;
}

type SelectProps = {
  label: string;
  options: Option[];
} & DetailedHTMLProps<
  SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className, options, ...props }, ref) => (
    <label className={`flex flex-col gap-1 ${className}`}>
      {label}
      <select ref={ref} {...props}>
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
);

export default Select;
