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
  searchTerm?: string
  setSearchTerm?: (term: string) => void
  loading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          {searchKey && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${searchKey}...`}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="pl-9 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/30"
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
              className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
            >
              Reset
              <FilterX className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden h-9 lg:flex border-muted-foreground/20 bg-background/50 hover:bg-muted/50"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                View
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

      <div className="relative overflow-hidden rounded-xl border border-muted-foreground/20 bg-card/30 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <Table className="relative">
            <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur-md transition-colors border-b border-muted-foreground/10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-0">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    return (
                      <TableHead key={header.id} className="py-4 px-4 h-14">
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
                                className="-ml-3 h-9 px-3 font-semibold text-foreground/90 hover:bg-muted/80 hover:text-foreground transition-all group rounded-lg"
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                <div className="ml-2 flex flex-col justify-center">
                                  {header.column.getIsSorted() === "asc" ? (
                                    <ArrowUp className="h-4 w-4 text-primary animate-in zoom-in-50 duration-300" />
                                  ) : header.column.getIsSorted() === "desc" ? (
                                    <ArrowDown className="h-4 w-4 text-primary animate-in zoom-in-50 duration-300" />
                                  ) : (
                                    <ArrowUpDown className="h-4 w-4 text-muted-foreground/30 transition-opacity" />
                                  )}
                                </div>
                              </Button>
                            ) : (
                              <span className="font-semibold text-foreground/90 px-1">
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
                  <TableRow key={i} className="hover:bg-transparent border-b-muted-foreground/10">
                    {columns.map((_, j) => (
                      <TableCell key={j} className="py-6 px-4">
                        <Skeleton className="h-5 w-full opacity-40 rounded-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group border-b-muted-foreground/10 hover:bg-primary/[0.03] transition-all duration-300"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 px-4 h-16">
                        <div className={cn(
                          "flex items-center text-sm font-medium",
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
                  <TableCell colSpan={columns.length} className="h-64 text-center bg-muted/5">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-60">
                      <div className="rounded-full bg-muted/50 p-6 shadow-inner animate-in zoom-in-50 duration-500">
                        <Database className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-bold tracking-tight">No records found</p>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">Try refining your search or adjusting the filters to discover more data.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium hidden sm:block">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-background/50 border-muted-foreground/20">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex border-muted-foreground/20 bg-background/50"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-muted-foreground/20 bg-background/50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-muted-foreground/20 bg-background/50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex border-muted-foreground/20 bg-background/50"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
