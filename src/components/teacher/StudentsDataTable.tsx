'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Student, StudentReport } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const calculateAverages = (studentId: string, reports: StudentReport[]) => {
  const studentReports = reports.filter((r) => r.studentId === studentId);
  if (studentReports.length === 0) {
    return { avgStudyHours: 0, avgMood: 0 };
  }
  const totalStudyMinutes = studentReports.reduce((sum, report) => {
    return sum + report.items.reduce((itemSum, item) => itemSum + item.studyTime, 0);
  }, 0);
  const totalMood = studentReports.reduce((sum, report) => sum + report.moodScore, 0);

  return {
    avgStudyHours: (totalStudyMinutes / 60 / studentReports.length).toFixed(1),
    avgMood: (totalMood / studentReports.length).toFixed(1),
  };
};

export const getColumns = (reports: StudentReport[]): ColumnDef<Student>[] => [
  {
    accessorKey: 'name',
    header: 'نام',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={row.original.avatarUrl} alt={row.original.name} />
          <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'class',
    header: 'کلاس',
    cell: ({ row }) => <Badge variant="secondary">{row.original.class}</Badge>,
  },
  {
    id: 'avgStudyHours',
    header: 'میانگین مطالعه (ساعت)',
    cell: ({ row }) => calculateAverages(row.original.id, reports).avgStudyHours,
  },
  {
    id: 'avgMood',
    header: 'میانگین رضایت',
    cell: ({ row }) => calculateAverages(row.original.id, reports).avgMood,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="text-left">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">باز کردن منو</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className='font-body'>
            <DropdownMenuLabel>عملیات</DropdownMenuLabel>
            <DropdownMenuItem asChild>
                <Link href={`/teacher/students/${student.id}`}>مشاهده جزئیات</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>ویرایش پروفایل</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                حذف دانش‌آموز
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      );
    },
  },
];


interface StudentsDataTableProps {
  students: Student[];
  reports: StudentReport[];
}

export default function StudentsDataTable({ students, reports }: StudentsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const columns = React.useMemo(() => getColumns(reports), [reports]);

  const table = useReactTable({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="جستجوی دانش‌آموز..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-right">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  نتیجه‌ای یافت نشد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
