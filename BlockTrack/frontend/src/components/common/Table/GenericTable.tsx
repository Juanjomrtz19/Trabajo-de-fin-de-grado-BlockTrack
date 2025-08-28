import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

export type GenericTableProps<TData extends object> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  pageSizeOptions?: number[];
  initialPageSize?: number;
  enableGlobalFilter?: boolean;
  onRowClick?: (row: TData) => void;
  className?: string;
};

function classNames(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function toStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

export default function GenericTable<TData extends object>({
  columns,
  data,
  pageSizeOptions = [5, 10, 20, 50],
  initialPageSize = 10,
  enableGlobalFilter = true,
  onRowClick,
  className,
}: GenericTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: initialPageSize } },
  });

  return (
    <div className={classNames("w-full", className)}>
      {enableGlobalFilter && (
        <div className="mb-3 flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded-xl border border-gray-300 px-2 py-2"
            aria-label="Tamaño de página"
          >
            {pageSizeOptions.map((ps) => (
              <option key={ps} value={ps}>
                {ps} / pág.
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const dir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={classNames(
                        "px-4 py-3 text-left font-semibold text-gray-700 select-none",
                        canSort && "cursor-pointer hover:bg-gray-100"
                      )}
                      scope="col"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <span aria-hidden className="text-gray-400">
                            {dir === "asc" ? "▲" : dir === "desc" ? "▼" : "↕"}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
                className={classNames(
                  "border-t border-gray-100",
                  onRowClick && "cursor-pointer hover:bg-gray-50"
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const userCell = cell.column.columnDef.cell;

                  return (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-gray-800 align-top"
                    >
                      {userCell
                        ? // ✅ si la columna define cell, respétalo (aquí verás "YYYY-MM-DD")
                          flexRender(userCell, cell.getContext())
                        : // 🔁 fallback genérico con truncado para strings
                          (() => {
                            const raw = cell.getValue?.();
                            const s = toStr(raw);
                            const truncated =
                              typeof s === "string" ? truncateText(s, 30) : s;
                            return <span title={s}>{truncated as any}</span>;
                          })()}
                    </td>
                  );
                })}
              </tr>
            ))}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border px-3 py-1 disabled:opacity-40"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            « Primera
          </button>
          <button
            className="rounded-xl border px-3 py-1 disabled:opacity-40"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ‹ Anterior
          </button>
          <button
            className="rounded-xl border px-3 py-1 disabled:opacity-40"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente ›
          </button>
          <button
            className="rounded-xl border px-3 py-1 disabled:opacity-40"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Última »
          </button>
        </div>
      </div>
    </div>
  );
}
