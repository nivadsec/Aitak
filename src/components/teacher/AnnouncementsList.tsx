'use client';

import * as React from 'react';
import { doc } from 'firebase/firestore';
import { Edit, MoreVertical, Trash2, AlertTriangle } from 'lucide-react';

import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useFirebase } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnnouncementForm } from './AnnouncementForm';

type Announcement = {
  id: string;
  content: string;
  timestamp: any;
  [key: string]: any;
};

interface AnnouncementsListProps {
  announcements: Announcement[];
}

export function AnnouncementsList({ announcements }: AnnouncementsListProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [deletingAnnouncement, setDeletingAnnouncement] = React.useState<Announcement | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = React.useState<Announcement | null>(null);

  const handleDelete = (announcementId: string) => {
    const announcementRef = doc(firestore, 'announcements', announcementId);
    deleteDocumentNonBlocking(announcementRef);
    setDeletingAnnouncement(null);
    toast({
      title: "اطلاعیه حذف شد",
      description: "اطلاعیه مورد نظر با موفقیت حذف شد.",
      variant: 'destructive',
      className: 'font-body',
    });
  };

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">هیچ اطلاعیه‌ای یافت نشد</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          برای ایجاد اولین اطلاعیه، روی دکمه "اطلاعیه جدید" کلیک کنید.
        </p>
      </div>
    );
  }

  return (
    <>
      <Dialog open={!!editingAnnouncement} onOpenChange={(open) => !open && setEditingAnnouncement(null)}>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">اطلاعیه</CardTitle>
                  <CardDescription>
                    منتشر شده در: {new Date(announcement.timestamp?.seconds * 1000).toLocaleString('fa-IR')}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingAnnouncement(announcement)}>
                      <Edit className="ml-2 h-4 w-4" />
                      ویرایش
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => setDeletingAnnouncement(announcement)}
                    >
                      <Trash2 className="ml-2 h-4 w-4" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-foreground/90">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline">ویرایش اطلاعیه</DialogTitle>
            <DialogDescription>
              متن اطلاعیه را ویرایش کرده و تغییرات را ذخیره کنید.
            </DialogDescription>
          </DialogHeader>
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSuccess={() => setEditingAnnouncement(null)}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deletingAnnouncement} onOpenChange={(open) => !open && setDeletingAnnouncement(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              آیا از حذف اطلاعیه مطمئن هستید؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              این عمل قابل بازگشت نیست و اطلاعیه برای همیشه حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => handleDelete(deletingAnnouncement!.id)}
            >
              حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
