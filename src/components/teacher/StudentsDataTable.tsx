'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { MoreHorizontal, Trash2, Edit, ToggleLeft, ToggleRight, AlertTriangle, User, LineChart } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Student, StudentReport } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StudentForm } from './StudentForm';
import { useFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const calculateAverages = (studentId: string, reports: StudentReport[]) => {
  const studentReports = reports.filter((r) => r.studentId === studentId);
  if (studentReports.length === 0) {
    return { avgStudyHours: 'N/A', avgMood: 'N/A' };
  }
  const totalStudyMinutes = studentReports.reduce((sum, report) => {
    return sum + (report.items || []).reduce((itemSum, item) => itemSum + (item.studyTime || 0), 0);
  }, 0);

  const totalMood = studentReports.reduce((sum, report) => sum + (report.moodScore || 0), 0);

  const avgStudyHours = (totalStudyMinutes / 60 / studentReports.length).toFixed(1);
  const avgMood = (totalMood / studentReports.length).toFixed(1);
  
  return {
    avgStudyHours: parseFloat(avgStudyHours) > 0 ? avgStudyHours : '0',
    avgMood: parseFloat(avgMood) > 0 ? avgMood : '0'
  };
};

interface StudentsDataTableProps {
  students: Student[];
  reports: StudentReport[];
}

export default function StudentsDataTable({ students, reports }: StudentsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = React.useState<Student | null>(null);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleToggleActive = (student: Student) => {
    if (!user) return;
    const studentRef = doc(firestore, 'teachers', user.uid, 'students', student.id);
    updateDocumentNonBlocking(studentRef, { isActive: !student.isActive });
    toast({
        title: "وضعیت دانش‌آموز تغییر کرد",
        description: `پنل دانش‌آموز ${student.firstName} ${student.lastName} ${student.isActive ? 'غیرفعال' : 'فعال'} شد.`,
        className: 'font-body',
    });
  };

  const handleDelete = (studentId: string) => {
    if (!user) return;
    const studentRef = doc(firestore, 'teachers', user.uid, 'students', studentId);
    deleteDocumentNonBlocking(studentRef);
    setDeletingStudent(null);
    toast({
        title: "دانش‌آموز حذف شد",
        description: "دانش‌آموز با موفقیت از سیستم حذف شد.",
        variant: 'destructive',
        className: 'font-body',
    });
  }

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'fullName',
      header: 'نام دانش آموز',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={(row.original as any).avatarUrl} alt={`${row.original.firstName} ${row.original.lastName}`} />
            <AvatarFallback>{row.original.firstName?.charAt(0) ?? ''}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{`${row.original.firstName} ${row.original.lastName}`}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
        id: 'avgStudyHours',
        header: 'میانگین مطالعه (ساعت)',
        cell: ({ row }) => {
            const { avgStudyHours } = calculateAverages(row.original.id, reports);
            return <span>{avgStudyHours}</span>;
        }
    },
    {
        id: 'avgMood',
        header: 'میانگین روانی',
        cell: ({ row }) => {
            const { avgMood } = calculateAverages(row.original.id, reports);
            return <span>{avgMood}</span>;
        }
    },
    {
      accessorKey: 'isActive',
      header: 'وضعیت',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'destructive'}>
          {row.original.isActive ? 'فعال' : 'غیرفعال'}
        </Badge>
      ),
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
                  <Link href={`/teacher/students/${student.id}`}>
                    <LineChart className="ml-2 h-4 w-4" />
                    مشاهده جزئیات و تحلیل
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                <Edit className="ml-2 h-4 w-4" />
                ویرایش پروفایل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleActive(student)}>
                {student.isActive ? <ToggleLeft className="ml-2 h-4 w-4" /> : <ToggleRight className="ml-2 h-4 w-4" />}
                {student.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => setDeletingStudent(student)}
              >
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف دانش‌آموز
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        );
      },
    },
  ];

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
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="جستجوی دانش‌آموز..."
          value={(table.getColumn('fullName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('fullName')?.setFilterValue(event.target.value)
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
                  className="cursor-pointer"
                  onClick={() => {
                     const student = row.original;
                     window.location.href = `/teacher/students/${student.id}`;
                  }}
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

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">ویرایش اطلاعات دانش‌آموز</DialogTitle>
            <DialogDescription>
              اطلاعات دانش‌آموز را در اینجا به‌روزرسانی کنید.
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            student={editingStudent}
            onSuccess={() => setEditingStudent(null)}
            onCancel={() => setEditingStudent(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Student Alert Dialog */}
      <AlertDialog open={!!deletingStudent} onOpenChange={(open) => !open && setDeletingStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              آیا از حذف این دانش‌آموز مطمئن هستید؟
              </AlertDialogTitle>
            <AlertDialogDescription>
              این عمل قابل بازگشت نیست. با این کار حساب کاربری دانش‌آموز و تمام داده‌های مرتبط با او برای همیشه حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => handleDelete(deletingStudent!.id)}>
                حذف کن
              </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
