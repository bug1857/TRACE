'use client';

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

export interface Column<T> {
  header: string;
  accessorKey: string; // supporting nested keys or key strings
  cell?: (row: T) => React.ReactNode;
  isNumeric?: boolean;
  sortable?: boolean;
  // custom accessor function if needed
  accessorFn?: (row: T) => any;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

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
      let aValue = column.accessorFn ? column.accessorFn(a) : a[sortConfig.key];
      let bValue = column.accessorFn ? column.accessorFn(b) : b[sortConfig.key];

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
    <div className="w-full border border-[#E2E0D8] rounded-md overflow-hidden bg-[#FAFAF8]">
      <Table className="border-collapse w-full">
        <TableHeader className="bg-[#F3F2EE] border-b-2 border-[#E2E0D8]">
          <TableRow className="hover:bg-transparent border-b-0 h-[38px]">
            {columns.map((column) => {
              const isSorted = sortConfig?.key === column.accessorKey;
              const isAsc = sortConfig?.direction === 'asc';

              return (
                <TableHead
                  key={column.accessorKey}
                  onClick={() => handleSort(column)}
                  className={`text-[10px] font-sans font-medium text-[#9B9891] tracking-wider uppercase py-2 px-4 border-b border-[#E2E0D8] select-none ${
                    column.sortable ? 'cursor-pointer hover:text-[#1A1917]' : ''
                  } ${column.isNumeric ? 'text-right' : 'text-left'}`}
                >
                  <div className={`flex items-center gap-1 ${column.isNumeric ? 'justify-end' : 'justify-start'}`}>
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="text-[#9B9891]">
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
          {sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => (
              <TableRow
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`h-[44px] border-b border-[#E2E0D8] last:border-b-0 transition-colors hover:bg-[#F3F2EE]/50 ${
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
                      className={`text-[13px] px-4 py-2 text-[#1A1917] font-sans border-r border-[#E2E0D8] last:border-r-0 ${
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
              <TableCell colSpan={columns.length} className="text-center py-8 text-[13px] text-[#6B6963] font-sans">
                No records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
