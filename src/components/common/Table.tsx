import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/outline";
import { ReactElement, useState } from "react";

type ElementRenderer<T> = (x: T) => ReactElement;
type StringRenderer<T> = (x: T) => string;

export interface TableProps<T extends Record<string, any>> {
  labels: string[];
  columns: (keyof T | ElementRenderer<T> | StringRenderer<T>)[];
  data: T[];
  onClick?: (d: T) => void;
  initialSortKeyIndex?: number;
}

function Table<T extends Record<string, any>>({
  labels,
  columns,
  data,
  onClick: handleClick,
  initialSortKeyIndex = 0,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | ElementRenderer<T> | StringRenderer<T> | null;
    isAscending: boolean;
  }>({ key: columns[initialSortKeyIndex], isAscending: true });

  const sortedData = data.sort((a, b) => {
    if (
      typeof sortConfig.key === "function"
        ? sortConfig.key(a) < sortConfig.key(b)
        : a[sortConfig.key!] < b[sortConfig.key!]
    )
      return sortConfig.isAscending ? -1 : 1;
    else {
      return sortConfig.isAscending ? 1 : -1;
    }
  });

  function isElementRenderer(
    f: keyof T | ElementRenderer<T> | StringRenderer<T>
  ): f is ElementRenderer<T> {
    if (data.length === 0) return false;
    return typeof f === "function" && typeof f(data[0]) !== "string";
  }

  return (
    <table className="border-collapse select-none bg-white text-center shadow-md">
      <thead>
        <tr>
          {labels.map((label, idx) => (
            <th
              className="relative cursor-pointer border p-2 px-8"
              key={idx}
              onClick={() => {
                const key = columns[idx];
                if (isElementRenderer(key)) return;
                setSortConfig((oldConfig) => ({
                  key,
                  isAscending:
                    oldConfig.key === columns[idx]
                      ? !oldConfig.isAscending
                      : false,
                }));
              }}
            >
              {label}
              {sortConfig.isAscending ? (
                <ArrowUpIcon
                  className={`absolute top-1/2 right-0 h-6 w-6 -translate-y-1/2 rounded-full p-1 ${
                    sortConfig.key !== columns[idx] ? "hidden" : ""
                  }`}
                />
              ) : (
                <ArrowDownIcon
                  className={`absolute top-1/2 right-0 h-6 w-6 -translate-y-1/2 rounded-full p-1 ${
                    sortConfig.key !== columns[idx] ? "hidden" : ""
                  }`}
                />
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((d, idx) => (
          <tr
            key={idx}
            className={`${
              handleClick ? "cursor-pointer hover:bg-gray-100" : ""
            }`}
            onClick={(e) => {
              handleClick && handleClick(d);
            }}
          >
            {columns.map((col, idx) => (
              <td className="p-2" key={idx}>
                {typeof col === "function" ? col(d) : d[col]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
