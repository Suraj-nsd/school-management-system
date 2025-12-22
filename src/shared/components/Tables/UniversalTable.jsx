import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function UniversalTable({ data, columns, globalFilter, setGlobalFilter }) {
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="bg-primary text-white">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    style={{ cursor: "pointer" }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc" ? (
                      <FaSortUp />
                    ) : h.column.getIsSorted() === "desc" ? (
                      <FaSortDown />
                    ) : (
                      <FaSort />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5 text-muted">
                  No data found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className="small text-muted">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div>
          <button
            className="btn btn-outline-primary btn-sm me-2"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FaChevronLeft />
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
