'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface Column<T> {
  header: string;
  accessorKey: string; // supporting nested keys or key strings
  cell?: (row: T) => React.ReactNode;
  isNumeric?: boolean;
  sortable?: boolean;
  // custom accessor function if needed
  accessorFn?: (row: T) => unknown;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  pageSize = 100
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when data or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data, sortConfig]);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === column.accessorKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: column.accessorKey, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const column = columns.find(c => c.accessorKey === sortConfig.key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aValue = column.accessorFn ? column.accessorFn(a) : a[sortConfig.key];
      const bValue = column.accessorFn ? column.accessorFn(b) : b[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Numbers or booleans
      return sortConfig.direction === 'asc'
        ? (aValue > bValue ? 1 : -1)
        : (bValue > aValue ? 1 : -1);
    });
  }, [data, sortConfig, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div className="w-full border border-[var(--border)] rounded-md overflow-hidden bg-[var(--background)] flex flex-col">
      <div className="overflow-x-auto w-full">
        <Table className="border-collapse w-full">
          <TableHeader className="bg-[var(--card)] border-b-2 border-[var(--border)]">
            <TableRow className="hover:bg-transparent border-b-0 h-[38px]">
              {columns.map((column) => {
                const isSorted = sortConfig?.key === column.accessorKey;
                const isAsc = sortConfig?.direction === 'asc';

                return (
                  <TableHead
                    key={column.accessorKey}
                    onClick={() => handleSort(column)}
                    className={`text-[10px] font-sans font-medium text-[var(--trace-subtle)] tracking-wider uppercase py-2 px-4 border-b border-[var(--border)] select-none ${
                      column.sortable ? 'cursor-pointer hover:text-[var(--foreground)]' : ''
                    } ${column.isNumeric ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`flex items-center gap-1 ${column.isNumeric ? 'justify-end' : 'justify-start'}`}>
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="text-[var(--trace-subtle)]">
                          {isSorted ? (
                            isAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`h-[44px] border-b border-[var(--border)] last:border-b-0 transition-colors duration-200 hover:bg-[var(--card)]/50 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((column) => {
                    const cellContent = column.cell
                      ? column.cell(row)
                      : column.accessorFn
                      ? column.accessorFn(row)
                      : row[column.accessorKey];

                    return (
                      <TableCell
                        key={column.accessorKey}
                        className={`text-[13px] px-4 py-2 text-[var(--foreground)] font-sans border-r border-[var(--border)] last:border-r-0 ${
                          column.isNumeric ? 'text-right font-mono' : 'text-left'
                        }`}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-[13px] text-[var(--muted-foreground)] font-sans">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {sortedData.length > pageSize && (
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2 bg-[var(--card)]">
          <div className="text-[12px] text-[var(--muted-foreground)] font-sans">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length.toLocaleString()} entries
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-[var(--border)]"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-[var(--border)]"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-[12px] font-sans font-medium px-2 text-[var(--foreground)]">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-[var(--border)]"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-[var(--border)]"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

