import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/outline";
import { useState } from "react";

interface TableProps<T extends Object> {
  labels: string[];
  columns: (keyof T | ((row: T) => string))[];
  data: T[];
  onClick?: (d: T) => void;
}

function Table<T>({
  labels,
  columns,
  data,
  onClick: handleClick,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | ((row: T) => string) | null;
    isAscending: boolean;
  }>({ key: columns[0], isAscending: true });

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

  return (
    <table className="bg-white shadow-md text-center border-collapse select-none">
      <thead>
        <tr>
          <th className="p-2 border">번호</th>
          {labels.map((label, idx) => (
            <th
              className="relative p-2 px-8 cursor-pointer border"
              key={idx}
              onClick={() =>
                setSortConfig((oldConfig) => ({
                  key: columns[idx],
                  isAscending:
                    oldConfig.key === columns[idx]
                      ? !oldConfig.isAscending
                      : false,
                }))
              }
            >
              {label}
              {sortConfig.isAscending ? (
                <ArrowUpIcon
                  className={`absolute top-1/2 -translate-y-1/2 right-0 h-6 w-6 p-1 rounded-full ${
                    sortConfig.key !== columns[idx] ? "hidden" : ""
                  }`}
                />
              ) : (
                <ArrowDownIcon
                  className={`absolute top-1/2 -translate-y-1/2 right-0 h-6 w-6 p-1 rounded-full ${
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
            <td className="p-2">{idx + 1}</td>
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
