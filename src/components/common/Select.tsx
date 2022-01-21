import { DetailedHTMLProps, forwardRef, SelectHTMLAttributes } from "react";

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
