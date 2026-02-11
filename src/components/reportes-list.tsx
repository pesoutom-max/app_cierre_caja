'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle } from 'lucide-react';

interface DailyClose {
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
}

const formatDate = (timestamp: { seconds: number; nanoseconds: number; }) => {
  if (!timestamp || !timestamp.seconds) {
    return 'Fecha inválida';
  }
  const date = new Date(timestamp.seconds * 1000);
  return format(date, "PPP", { locale: es });
};

export default function ReportesList() {
  const firestore = useFirestore();
  const dailyClosesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'daily_closes'), orderBy('date', 'desc')) : null),
    [firestore]
  );

  const { data: reports, isLoading, error } = useCollection<DailyClose>(dailyClosesQuery);

  const totalSales = (report: DailyClose) => {
    return report.totalCashSales + report.totalCardSales + report.totalTransferSales + report.totalGiftCardSales + report.totalDeliverySales;
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
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
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
    <Card>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{formatDate(report.date)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalSales(report))}</TableCell>
                <TableCell className="text-right">{formatCurrency(report.expectedCashBalance)}</TableCell>
                <TableCell className="text-right text-destructive">{formatCurrency(report.cashExpenses)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
