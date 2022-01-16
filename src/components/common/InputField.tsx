import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from "react";

type InputFieldProps = {
  label: string;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, className, ...props }, ref) => (
    <label className={`flex flex-col gap-1 ${className}`}>
      {label}
      <input ref={ref} {...props} />
    </label>
  )
);

export default InputField;
