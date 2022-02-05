import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLLIElement> {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
}

function Card({ title, subtitle, description, actions, ...props }: CardProps) {
  return (
    <li
      className="flex w-full cursor-pointer select-none flex-col gap-2 rounded-xl bg-white p-4 shadow-lg transition-transform hover:scale-105 hover:shadow-xl sm:h-40 sm:w-40"
      tabIndex={0}
      {...props}
    >
      <section>
        {subtitle && <p className="font-light">{subtitle}</p>}
        <h3 className="font-semibold">{title}</h3>
      </section>
      {description && <p>{description}</p>}
      {actions && (
        <section className="flex flex-grow items-end justify-end gap-1">
          {actions}
        </section>
      )}
    </li>
  );
}

export default Card;
