'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, getDocs, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, Pencil, Share, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';
import { EditReportForm } from './edit-report-form';


export interface DailyClose {
    id: string;
    date: { seconds: number; nanoseconds: number; }; // Firestore Timestamp
    startingCashBalance: number;
    totalCashSales: number;
    totalCardSales: number;
    totalTransferSales: number;
    totalGiftCardSales: number;
    totalDeliverySales: number;
    cashExpenses: number;
    expectedCashBalance: number;
    notes?: string;
    totalCashInBox?: number;
    cashDifference?: number;
}

const formatDate = (timestamp: { seconds: number; nanoseconds: number; } | Date) => {
  if (!timestamp) return 'Fecha inválida';
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp.seconds * 1000);
  return format(date, "PPP", { locale: es });
};

const totalSales = (report: DailyClose) => {
  return report.totalCashSales + report.totalCardSales + report.totalTransferSales + report.totalGiftCardSales + report.totalDeliverySales;
}

export default function ReportesList() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [reportToDelete, setReportToDelete] = React.useState<DailyClose | null>(null);
  const [reportToEdit, setReportToEdit] = React.useState<DailyClose | null>(null);

  const dailyClosesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'daily_closes'), orderBy('date', 'desc')) : null),
    [firestore]
  );

  const { data: reports, isLoading, error } = useCollection<DailyClose>(dailyClosesQuery);

  const handleShare = (report: DailyClose) => {
    const reportDate = report.date instanceof Date ? report.date : new Date(report.date.seconds * 1000);
    
    let message = `*Resumen de Caja - ${format(reportDate, "PPP", { locale: es })}*

*Resumen General:*
- Venta Total: ${formatCurrency(totalSales(report))}
- Saldo Esperado: ${formatCurrency(report.expectedCashBalance)}`;

    if (report.totalCashInBox !== undefined && report.cashDifference !== undefined) {
        message += `
- Efectivo Real: ${formatCurrency(report.totalCashInBox)}
- *Diferencia: ${formatCurrency(report.cashDifference)}*`;
    }

    message += `

*Desglose de Ingresos:*
- Efectivo: ${formatCurrency(report.totalCashSales)}
- Tarjetas: ${formatCurrency(report.totalCardSales)}
- Transferencias: ${formatCurrency(report.totalTransferSales)}
- Gift Cards: ${formatCurrency(report.totalGiftCardSales)}
- Delivery: ${formatCurrency(report.totalDeliverySales)}

Saludos.`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteConfirm = async () => {
    if (!firestore || !reportToDelete) return;
    try {
        const reportRef = doc(firestore, 'daily_closes', reportToDelete.id);
        const deliverySalesRef = collection(reportRef, 'delivery_service_sales');
        
        const batch = writeBatch(firestore);
        
        const deliverySalesSnapshot = await getDocs(deliverySalesRef);
        deliverySalesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        batch.delete(reportRef);
        
        await batch.commit();

        toast({ title: "Reporte eliminado", description: `El reporte del ${formatDate(new Date(reportToDelete.date.seconds * 1000))} ha sido eliminado.` });

    } catch (error: any) {
        console.error("Error deleting report: ", error);
        toast({
            variant: "destructive",
            title: "Error al eliminar",
            description: error.message || "No se pudo eliminar el reporte.",
        });
    } finally {
        setReportToDelete(null);
    }
}


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reportes</CardTitle>
          <CardDescription>Revisa los cierres de caja de días anteriores.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Error al cargar reportes</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">No se pudieron cargar los reportes. Intenta de nuevo más tarde.</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
            </CardContent>
        </Card>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Historial de Reportes</CardTitle>
            <CardDescription>Revisa los cierres de caja de días anteriores.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border-2 border-dashed rounded-lg">
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No hay reportes</h3>
                <p className="text-muted-foreground">Aún no se ha guardado ningún cierre de caja.</p>
            </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <>
      {/* Desktop View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Historial de Reportes</CardTitle>
          <CardDescription>Revisa los cierres de caja de días anteriores.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Venta Total</TableHead>
                <TableHead className="text-right">Saldo Esperado</TableHead>
                <TableHead className="text-right">Gastos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{formatDate(report.date)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalSales(report))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(report.expectedCashBalance)}</TableCell>
                  <TableCell className="text-right text-destructive">{formatCurrency(report.cashExpenses)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleShare(report)}>
                          <Share className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setReportToEdit(report)}>
                          <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setReportToDelete(report)}>
                          <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {reports.map(report => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle>{formatDate(report.date)}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p className="text-muted-foreground">Venta Total</p>
              <p className="text-right font-medium">{formatCurrency(totalSales(report))}</p>

              <p className="text-muted-foreground">Saldo Esperado</p>
              <p className="text-right font-medium">{formatCurrency(report.expectedCashBalance)}</p>

              <p className="text-muted-foreground">Gastos</p>
              <p className="text-right font-medium text-destructive">{formatCurrency(report.cashExpenses)}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleShare(report)}>
                    <Share className="h-4 w-4 mr-2" />
                    Compartir
                </Button>
                <Button variant="outline" size="sm" onClick={() => setReportToEdit(report)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setReportToDelete(report)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Eliminar
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>


      <Dialog open={!!reportToEdit} onOpenChange={(isOpen) => !isOpen && setReportToEdit(null)}>
        <DialogContent className="max-w-full sm:max-w-2xl lg:max-w-4xl h-full sm:h-auto">
            <DialogHeader>
                <DialogTitle>Editar Reporte del {reportToEdit ? formatDate(new Date(reportToEdit.date.seconds * 1000)): ''}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto">
              {reportToEdit && <EditReportForm report={reportToEdit} onFinished={() => setReportToEdit(null)} />}
            </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!reportToDelete} onOpenChange={(isOpen) => !isOpen && setReportToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente el reporte del día {reportToDelete ? formatDate(new Date(reportToDelete.date.seconds * 1000)) : ''}.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
