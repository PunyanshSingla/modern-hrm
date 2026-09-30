"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowData
} from "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
  }
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  LayoutGrid,
  Database,
  FilterX
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import SearchInput from "../SearchInput"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  searchTerm?: string
  setSearchTerm?: (term: string) => void
  loading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  searchTerm,
  setSearchTerm,
  loading = false
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2">
          {searchKey && (
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={searchPlaceholder || `Search ${searchKey}...`}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="pl-10 h-9 text-xs rounded-lg bg-card border-muted-foreground/30 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/40 shadow-none outline-none"
              />
            </div>
          )}
          {searchTerm !== undefined && setSearchTerm !== undefined && (
            <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          )}
          {table.getState().columnFilters.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-foreground self-start sm:self-auto"
            >
              Reset
              <FilterX className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 flex border-muted-foreground/20 bg-background/50 hover:bg-muted/50 text-xs"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.columnDef.header === "string" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop & Tablet Table View */}
      <div className="hidden sm:block relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <Table className="relative min-w-full">
            <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur-md border-b border-border/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-0">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    return (
                      <TableHead key={header.id} className="py-2.5 px-4 h-10">
                        {header.isPlaceholder ? null : (
                          <div className={cn(
                            "flex items-center",
                            header.column.columnDef.meta?.className
                          )}>
                            {canSort ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                className="-ml-2 h-7 px-2 font-semibold text-xs text-muted-foreground hover:text-foreground transition-all group rounded-md"
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                <div className="ml-1.5 flex flex-col justify-center">
                                  {header.column.getIsSorted() === "asc" ? (
                                    <ArrowUp className="h-3.5 w-3.5 text-primary" />
                                  ) : header.column.getIsSorted() === "desc" ? (
                                    <ArrowDown className="h-3.5 w-3.5 text-primary" />
                                  ) : (
                                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                                  )}
                                </div>
                              </Button>
                            ) : (
                              <span className="font-semibold text-xs text-muted-foreground px-1">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="bg-transparent">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {columns.map((_, j) => (
                      <TableCell key={j} className="py-3 px-4">
                        <Skeleton className="h-4 w-full opacity-40 rounded-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4 h-12">
                        <div className={cn(
                          "flex items-center text-xs font-medium text-foreground",
                          cell.column.columnDef.meta?.className
                        )}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center bg-muted/10">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                      <div className="rounded-full bg-muted/50 p-4 shadow-inner">
                        <Database className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">No records found</p>
                        <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">Try refining your search or filters.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View (shown only on small screens < sm) */}
      <div className="block sm:hidden space-y-3 min-w-0 w-full">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border/60 bg-card space-y-3 min-w-0">
              <div className="flex justify-between items-center min-w-0">
                <Skeleton className="h-5 w-36 rounded-md opacity-60" />
                <Skeleton className="h-6 w-16 rounded-full opacity-60" />
              </div>
              <div className="space-y-2 pt-2 border-t border-border/40">
                <Skeleton className="h-4 w-full rounded opacity-40" />
                <Skeleton className="h-4 w-3/4 rounded opacity-40" />
              </div>
            </div>
          ))
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const visibleCells = row.getVisibleCells();
            const actionsCell = visibleCells.find(
              (c) => c.column.id === "actions" || c.column.id === "action"
            );
            const dataCells = visibleCells.filter(
              (c) => c.column.id !== "actions" && c.column.id !== "action"
            );
            const primaryCell = dataCells[0];
            const remainingCells = dataCells.slice(1);

            return (
              <div
                key={row.id}
                className="p-4 rounded-xl border border-border/60 bg-card shadow-sm space-y-3 hover:border-primary/30 transition-all min-w-0 overflow-hidden"
              >
                {/* Header Row: Primary Cell + Action Button */}
                <div className="flex items-start justify-between gap-3 min-w-0">
                  {primaryCell && (
                    <div className="min-w-0 flex-1">
                      {flexRender(primaryCell.column.columnDef.cell, primaryCell.getContext())}
                    </div>
                  )}
                  {actionsCell && (
                    <div className="shrink-0 self-start">
                      {flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
                    </div>
                  )}
                </div>

                {/* Details Breakdown */}
                {remainingCells.length > 0 && (
                  <div className="space-y-2 pt-2.5 border-t border-border/40 min-w-0">
                    {remainingCells.map((cell) => {
                      const headerDef = cell.column.columnDef.header;
                      let headerLabel = "";
                      if (typeof headerDef === "string") {
                        headerLabel = headerDef;
                      } else if (cell.column.id) {
                        const rawId = cell.column.id.split(".").pop() || cell.column.id;
                        headerLabel = rawId
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase());
                      }

                      return (
                        <div
                          key={cell.id}
                          className="flex items-center justify-between gap-2 text-xs min-w-0"
                        >
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                            {headerLabel}
                          </span>
                          <div className="font-medium text-foreground text-right min-w-0 flex-1 flex justify-end items-center">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-card rounded-xl border border-border/60 space-y-3 min-w-0">
            <div className="flex flex-col items-center justify-center space-y-2 opacity-60">
              <div className="rounded-full bg-muted/50 p-3">
                <Database className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No records found</p>
              <p className="text-xs text-muted-foreground">Try refining your search or filters.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1 text-xs">
        <div className="text-muted-foreground text-center sm:text-left">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-muted-foreground">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-7 w-[65px] text-xs bg-background/50 border-border/60">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center text-xs font-medium text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              className="h-7 w-7 p-0 border-border/60 bg-background/50"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="First page"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              className="h-7 w-7 p-0 border-border/60 bg-background/50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              title="Previous page"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              className="h-7 w-7 p-0 border-border/60 bg-background/50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              title="Next page"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              className="h-7 w-7 p-0 border-border/60 bg-background/50"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              title="Last page"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
