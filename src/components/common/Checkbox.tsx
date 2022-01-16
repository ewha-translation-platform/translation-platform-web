import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from "react";

type CheckboxProps = {
  label: string;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => (
    <label className={`${className}`}>
      <input type="checkbox" ref={ref} {...props} />
      {label}
    </label>
  )
);

export default Checkbox;
