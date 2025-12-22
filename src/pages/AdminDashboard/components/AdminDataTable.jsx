// src/shared/pages/AdminDashboard/components/AdminDataTable.jsx
import React from "react";
import {
  FaSearch,
  FaSortUp,
  FaSortDown,
  FaSort,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
} from "react-icons/fa";
import { flexRender } from "@tanstack/react-table";

export default function AdminDataTable({
  tableInstance,
  columnsLength,
  expandedRow,
  onRowToggle,
  onDownloadPDF,
}) {
  const headerGroups = tableInstance.getHeaderGroups();
  const rowModel = tableInstance.getRowModel();
  const paginationState = tableInstance.getState().pagination;

  return (
    <>
      <div
        className="table-responsive"
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
          borderRadius: 14,
          border: "1px solid rgba(209,213,219,0.8)",
        }}
      >
        <table className="table align-middle mb-0">
          <thead
            className="text-white position-sticky top-0"
            style={{
              background:
                "linear-gradient(135deg, #004aad 0%, #0077ff 60%, #37a4ff 100%)",
              zIndex: 10,
            }}
          >
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      width: header.column.columnDef.size,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "0.06em",
                      cursor: header.column.getCanSort()
                        ? "pointer"
                        : "default",
                      userSelect: "none",
                      borderBottom: "none",
                      paddingBlock: "0.6rem",
                      whiteSpace: "nowrap",
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="d-flex align-items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <span>
                          {
                            {
                              asc: <FaSortUp />,
                              desc: <FaSortDown />,
                            }[header.column.getIsSorted()] || (
                              <FaSort className="opacity-50" />
                            )
                          }
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowModel.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columnsLength}
                  className="text-center py-5 text-muted"
                >
                  <div>
                    <FaSearch
                      size={40}
                      className="mb-3"
                      style={{ opacity: 0.2 }}
                    />
                    <p className="mb-0 fw-semibold">No data found</p>
                    <small>Try adjusting your search criteria</small>
                  </div>
                </td>
              </tr>
            ) : (
              rowModel.rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    onClick={() => onRowToggle(row.id)}
                    style={{
                      transition: "background-color 0.18s",
                      cursor: "pointer",
                      backgroundColor:
                        expandedRow === row.id
                          ? "rgba(219,234,254,0.7)"
                          : "transparent",
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          verticalAlign: "middle",
                          fontSize: "0.86rem",
                          borderTop: "1px solid rgba(229,231,235,0.8)",
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>

                  {expandedRow === row.id && (
                    <tr>
                      <td
                        colSpan={columnsLength}
                        className="bg-light"
                        style={{
                          padding: "1rem 1.25rem 1.1rem",
                          borderTop: "1px solid rgba(209,213,219,0.8)",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6
                            className="fw-bold mb-0"
                            style={{ color: "#004aad" }}
                          >
                            Details · {row.original.name || "Record"}
                          </h6>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownloadPDF(row.original);
                            }}
                            type="button"
                            style={{ borderRadius: 999 }}
                          >
                            <FaDownload className="me-2" />
                            Download PDF
                          </button>
                        </div>

                        <div className="row">
                          {Object.entries(row.original).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="col-md-6 mb-2"
                                style={{ fontSize: "0.85rem" }}
                              >
                                <strong className="text-capitalize">
                                  {key.replace(/_/g, " ")}:
                                </strong>{" "}
                                <span>
                                  {value === null
                                    ? "—"
                                    : value.toString()}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Rows per page:</span>
          <select
            className="form-select form-select-sm"
            value={paginationState.pageSize}
            onChange={(e) =>
              tableInstance.setPageSize(Number(e.target.value))
            }
            style={{ width: 90, borderRadius: 999 }}
          >
            {[5, 10, 20, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">
            Page {paginationState.pageIndex + 1} of{" "}
            {tableInstance.getPageCount()}
          </span>
          <div className="btn-group">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => tableInstance.previousPage()}
              disabled={!tableInstance.getCanPreviousPage()}
              style={{ borderRadius: "999px 0 0 999px" }}
            >
              <FaChevronLeft />
            </button>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => tableInstance.nextPage()}
              disabled={!tableInstance.getCanNextPage()}
              style={{ borderRadius: "0 999px 999px 0" }}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
