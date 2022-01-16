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
      className="w-full sm:w-40 sm:h-40 p-4 bg-white rounded-xl shadow-lg cursor-pointer hover:scale-105 hover:shadow-xl transition-transform select-none flex flex-col gap-2"
      tabIndex={0}
      {...props}
    >
      <section>
        {subtitle && <p className="font-light">{subtitle}</p>}
        <h3 className="font-semibold">{title}</h3>
      </section>
      {description && <p>{description}</p>}
      {actions && (
        <section className="flex-grow flex justify-end items-end gap-1">
          {actions}
        </section>
      )}
    </li>
  );
}

export default Card;
