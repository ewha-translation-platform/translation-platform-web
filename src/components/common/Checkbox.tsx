import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from "react";

type CheckboxProps = {
  label: string;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => (
    <label className={`${className}`}>
      <input type="checkbox" ref={ref} {...props} />
      <span className="ml-1 align-middle">{label}</span>
    </label>
  )
);

export default Checkbox;
