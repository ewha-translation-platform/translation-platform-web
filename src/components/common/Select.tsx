import {
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  SelectHTMLAttributes,
} from "react";

type SelectProps<V extends string | number = string | number> = {
  label: string;
  options: Option<V>[];
} & DetailedHTMLProps<
  SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

function SelectInner<V extends string | number = string | number>(
  { label, className, options, ...props }: SelectProps<V>,
  ref: ForwardedRef<HTMLSelectElement>
) {
  return (
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
  );
}
const Select = forwardRef(SelectInner) as <
  V extends string | number = string | number
>(
  props: SelectProps<V> & { ref?: ForwardedRef<HTMLSelectElement> }
) => ReturnType<typeof SelectInner>;

export default Select;
