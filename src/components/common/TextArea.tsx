import { DetailedHTMLProps, forwardRef, TextareaHTMLAttributes } from "react";

type TextAreaProps = {
  label: string;
  innerClassName?: string;
} & DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, className, innerClassName, ...props }, ref) => (
    <label className={`flex flex-col gap-1 ${className}`}>
      {label}
      <textarea ref={ref} className={innerClassName} {...props} />
    </label>
  )
);

export default TextArea;
