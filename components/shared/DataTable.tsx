'use client';

/* eslint-disable */
import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { m as motion } from 'framer-motion';

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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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

  return (
    <div className="w-full border border-[var(--border)] rounded-md overflow-hidden bg-[var(--background)]">
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
        <motion.tbody
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03, delayChildren: 0.05 } } }}
          initial="hidden"
          animate="visible"
          className="[&_tr:last-child]:border-0"
        >
          {sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => {
              const rowContent = columns.map((column) => {
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
              });

              const rowClasses = `h-[44px] border-b border-[var(--border)] last:border-b-0 transition-colors duration-200 hover:bg-[var(--card)]/50 ${
                onRowClick ? 'cursor-pointer' : ''
              } ${
                (row as any).severity === 'critical' ? 'row-critical' : (row as any).severity === 'warning' ? 'row-warning' : ''
              }`;

              if (rowIndex < 30) {
                return (
                  <motion.tr
                    key={row.id || rowIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } } }}
                    style={{ willChange: "transform, opacity" }}
                    className={rowClasses}
                  >
                    {rowContent}
                  </motion.tr>
                );
              } else {
                return (
                  <tr
                    key={row.id || rowIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={rowClasses}
                  >
                    {rowContent}
                  </tr>
                );
              }
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-[13px] text-[var(--muted-foreground)] font-sans">
                No records found.
              </TableCell>
            </TableRow>
          )}
        </motion.tbody>
      </Table>
    </div>
  );
}
