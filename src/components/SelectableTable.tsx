import Table, { TableProps } from "./common/Table";

interface SelectableTableProps<T extends Record<string, any>>
  extends TableProps<T> {
  getSelected: (row: T) => boolean;
  toggleSelect: (row: T) => void;
}

function SelectableTable<T extends Record<string, any>>({
  getSelected,
  toggleSelect,
  labels,
  columns,
  data,
  onClick: handleClick,
}: SelectableTableProps<T>) {
  return (
    <Table
      labels={["", ...labels]}
      data={data}
      columns={[
        (row) => (
          <input
            type="checkbox"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={() => toggleSelect(row)}
            checked={getSelected(row)}
          ></input>
        ),
        ...columns,
      ]}
      onClick={handleClick}
    />
  );
}

export default SelectableTable;
