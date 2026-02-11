"use client";

import * as React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { 
  Banknote, 
  PackageMinus, 
  Wallet, 
  CreditCard, 
  ArrowRightLeft, 
  Gift, 
  Bike, 
  School2, 
  Sigma, 
  PiggyBank,
  RotateCcw,
  Coins,
  AlertTriangle,
  Calendar as CalendarIcon,
  Share,
  Download,
  Save,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SalesData {
  saldoAnterior: number;
  gastosEfectivo: number;
  efectivo: number;
  tarjetas: number;
  transferencias: number;
  giftCards: number;
  pedidosYaIceScroll: number;
  pedidosYaWafix: number;
  pedidosYaMix: number;
  uberEats: number;
  junaeb: number;
}

const initialSalesData: SalesData = {
  saldoAnterior: 0,
  gastosEfectivo: 0,
  efectivo: 0,
  tarjetas: 0,
  transferencias: 0,
  giftCards: 0,
  pedidosYaIceScroll: 0,
  pedidosYaWafix: 0,
  pedidosYaMix: 0,
  uberEats: 0,
  junaeb: 0,
};

interface CashBreakdown {
  b20000: number;
  b10000: number;
  b5000: number;
  b2000: number;
  b1000: number;
  m500: number;
  m100: number;
  m50: number;
}

const initialCashBreakdown: CashBreakdown = {
  b20000: 0,
  b10000: 0,
  b5000: 0,
  b2000: 0,
  b1000: 0,
  m500: 0,
  m100: 0,
  m50: 0,
};

const denominations = [
    { label: "Billetes de $20.000", value: 20000, key: "b20000" as keyof CashBreakdown },
    { label: "Billetes de $10.000", value: 10000, key: "b10000" as keyof CashBreakdown },
    { label: "Billetes de $5.000", value: 5000, key: "b5000" as keyof CashBreakdown },
    { label: "Billetes de $2.000", value: 2000, key: "b2000" as keyof CashBreakdown },
    { label: "Billetes de $1.000", value: 1000, key: "b1000" as keyof CashBreakdown },
    { label: "Monedas de $500", value: 500, key: "m500" as keyof CashBreakdown },
    { label: "Monedas de $100", value: 100, key: "m100" as keyof CashBreakdown },
    { label: "Monedas de $50", value: 50, key: "m50" as keyof CashBreakdown },
];


export default function CajaForm() {
  const [date, setDate] = React.useState<Date>(new Date());
  const [sales, setSales] = React.useState<SalesData>(initialSalesData);
  const [cashBreakdown, setCashBreakdown] = React.useState<CashBreakdown>(initialCashBreakdown);
  
  const [totalSales, setTotalSales] = React.useState(0);
  const [expectedCash, setExpectedCash] = React.useState(0);
  const [totalCashInBox, setTotalCashInBox] = React.useState(0);
  const [difference, setDifference] = React.useState(0);

  const [isCalculating, setIsCalculating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const { toast } = useToast();
  const firestore = useFirestore();

  const handleInputChange = (field: keyof SalesData, value: string) => {
    const numericValue = parseInt(value, 10);
    setSales((prev) => ({
      ...prev,
      [field]: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const handleBreakdownChange = (field: keyof CashBreakdown, value: string) => {
    const numericValue = parseInt(value, 10);
    setCashBreakdown((prev) => ({
      ...prev,
      [field]: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const resetForm = () => {
    setSales(initialSalesData);
    setCashBreakdown(initialCashBreakdown);
    setDate(new Date());
    toast({
      title: "Formulario reiniciado",
      description: "Todos los campos han sido limpiados.",
    });
  }

  React.useEffect(() => {
    setIsCalculating(true);
    
    const { 
      efectivo, tarjetas, transferencias, giftCards, 
      pedidosYaIceScroll, pedidosYaWafix, pedidosYaMix, 
      uberEats, junaeb 
    } = sales;
    
    const total = 
      efectivo + tarjetas + transferencias + giftCards + 
      pedidosYaIceScroll + pedidosYaWafix + pedidosYaMix + 
      uberEats + junaeb;
    setTotalSales(total);

    const { saldoAnterior, gastosEfectivo } = sales;
    const cashBalance = saldoAnterior + efectivo - gastosEfectivo;
    setExpectedCash(cashBalance);
    
    const timer = setTimeout(() => setIsCalculating(false), 300);
    return () => clearTimeout(timer);
  }, [sales]);

  React.useEffect(() => {
    const total = denominations.reduce((acc, d) => {
        return acc + (cashBreakdown[d.key] || 0) * d.value;
    }, 0);
    setTotalCashInBox(total);
  }, [cashBreakdown]);

  React.useEffect(() => {
    setDifference(totalCashInBox - expectedCash);
  }, [totalCashInBox, expectedCash]);

  const getDifferenceColor = () => {
    if (difference < 0) return 'text-destructive';
    if (difference > 0) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getReportData = () => {
    return {
      date: serverTimestamp(),
      reportDate: date,
      sales,
      cashBreakdown,
      totalSales,
      expectedCash,
      totalCashInBox,
      difference,
    };
  };

  const handleSave = async () => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar a Firebase. Inténtalo de nuevo.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(firestore, "dailyReports"), getReportData());
      toast({
        title: "Reporte Guardado",
        description: `El reporte del ${format(date, "PPP", { locale: es })} ha sido guardado con éxito.`,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar el reporte. Revisa la consola para más detalles.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const reportData = getReportData();
    
    doc.setFontSize(20);
    doc.text("Reporte de Cierre de Caja", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Fecha: ${format(reportData.reportDate, "PPP", { locale: es })}`, 105, 28, { align: 'center' });

    autoTable(doc, {
      startY: 40,
      head: [['Resumen', 'Monto']],
      body: [
        ['Venta Total del Día', formatCurrency(reportData.totalSales)],
        ['Saldo Esperado en Caja', formatCurrency(reportData.expectedCash)],
        ['Efectivo Real en Caja', formatCurrency(reportData.totalCashInBox)],
        ['Diferencia', { content: formatCurrency(reportData.difference), styles: { textColor: reportData.difference < 0 ? [255, 0, 0] : [0, 0, 0] } }],
      ],
      theme: 'grid',
    });

    const lastTableY = (doc as any).lastAutoTable.finalY;
    
    autoTable(doc, {
      startY: lastTableY + 10,
      head: [['Concepto de Ingreso', 'Monto']],
      body: [
        ['Efectivo del Día', formatCurrency(reportData.sales.efectivo)],
        ['Monto en Tarjetas', formatCurrency(reportData.sales.tarjetas)],
        ['Transferencias Recibidas', formatCurrency(reportData.sales.transferencias)],
        ['Gift Cards Entregados', formatCurrency(reportData.sales.giftCards)],
        ['Pedidos Ya Ice Scroll', formatCurrency(reportData.sales.pedidosYaIceScroll)],
        ['Pedidos Ya Wafix', formatCurrency(reportData.sales.pedidosYaWafix)],
        ['Pedidos Ya Mix', formatCurrency(reportData.sales.pedidosYaMix)],
        ['Uber Eats', formatCurrency(reportData.sales.uberEats)],
        ['Junaeb', formatCurrency(reportData.sales.junaeb)],
        ['Saldo Anterior en Caja', formatCurrency(reportData.sales.saldoAnterior)],
        ['Gastos en Efectivo', formatCurrency(reportData.sales.gastosEfectivo)],
      ],
      theme: 'striped',
    });

    const secondTableY = (doc as any).lastAutoTable.finalY;

    autoTable(doc, {
      startY: secondTableY + 10,
      head: [['Denominación', 'Cantidad', 'Total']],
      body: denominations.map(d => [
        d.label,
        reportData.cashBreakdown[d.key] || '0',
        formatCurrency((reportData.cashBreakdown[d.key] || 0) * d.value)
      ]),
      didDrawPage: (data) => {
        data.settings.margin.top = 10;
      },
      theme: 'grid',
    });


    doc.save(`Reporte_Caja_${format(reportData.reportDate, "yyyy-MM-dd")}.pdf`);
  };

  const shareViaWhatsApp = () => {
    const reportData = getReportData();
    const message = `*Resumen de Caja - ${format(reportData.reportDate, "PPP", { locale: es })}*

*Resumen General:*
- Venta Total: ${formatCurrency(reportData.totalSales)}
- Saldo Esperado: ${formatCurrency(reportData.expectedCash)}
- Efectivo Real: ${formatCurrency(reportData.totalCashInBox)}
- *Diferencia: ${formatCurrency(reportData.difference)}*

*Ingresos:*
- Efectivo: ${formatCurrency(reportData.sales.efectivo)}
- Tarjetas: ${formatCurrency(reportData.sales.tarjetas)}
- Transferencias: ${formatCurrency(reportData.sales.transferencias)}

Saludos.`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      <Card className="lg:col-span-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Resumen del Día</CardTitle>
              <CardDescription>Totales calculados en base a los datos ingresados.</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => setDate(d || new Date())}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-lg bg-primary/10 border-2 border-dashed border-primary transition-all duration-300 ${isCalculating ? 'border-accent shadow-lg shadow-accent/20' : 'border-primary'}`}>
            <div className="flex items-center gap-4">
              <Sigma className="w-10 h-10 text-accent" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Venta Total del Día</p>
                <p className="text-3xl font-bold text-accent transition-all duration-300">{formatCurrency(totalSales)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <PiggyBank className="w-10 h-10 text-accent" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Esperado en Caja</p>
                <p className="text-3xl font-bold text-accent transition-all duration-300">{formatCurrency(expectedCash)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
                <Coins className="w-10 h-10 text-accent" />
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Efectivo Real en Caja</p>
                    <p className="text-3xl font-bold text-accent transition-all duration-300">{formatCurrency(totalCashInBox)}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <AlertTriangle className={`w-10 h-10 transition-colors duration-300 ${getDifferenceColor()}`} />
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Diferencia</p>
                    <p className={`text-3xl font-bold transition-all duration-300 ${getDifferenceColor()}`}>{formatCurrency(difference)}</p>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Caja y Gastos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputWithIcon
            label="Saldo Anterior en Caja"
            icon={<Banknote className="w-4 h-4" />}
            value={sales.saldoAnterior || ''}
            onChange={(e) => handleInputChange("saldoAnterior", e.target.value)}
            placeholder="0"
          />
          <InputWithIcon
            label="Gastos en Efectivo"
            icon={<PackageMinus className="w-4 h-4" />}
            value={sales.gastosEfectivo || ''}
            onChange={(e) => handleInputChange("gastosEfectivo", e.target.value)}
            placeholder="0"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingresos Principales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputWithIcon
            label="Efectivo del Día"
            icon={<Wallet className="w-4 h-4" />}
            value={sales.efectivo || ''}
            onChange={(e) => handleInputChange("efectivo", e.target.value)}
            placeholder="0"
          />
          <InputWithIcon
            label="Monto en Tarjetas"
            icon={<CreditCard className="w-4 h-4" />}
            value={sales.tarjetas || ''}
            onChange={(e) => handleInputChange("tarjetas", e.target.value)}
            placeholder="0"
          />
          <InputWithIcon
            label="Transferencias Recibidas"
            icon={<ArrowRightLeft className="w-4 h-4" />}
            value={sales.transferencias || ''}
            onChange={(e) => handleInputChange("transferencias", e.target.value)}
            placeholder="0"
          />
          <InputWithIcon
            label="Gift Cards Entregados"
            icon={<Gift className="w-4 h-4" />}
            value={sales.giftCards || ''}
            onChange={(e) => handleInputChange("giftCards", e.target.value)}
            placeholder="0"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputWithIcon
            label="Pedidos Ya Ice Scroll"
            icon={<Bike className="w-4 h-4" />}
            value={sales.pedidosYaIceScroll || ''}
            onChange={(e) => handleInputChange("pedidosYaIceScroll", e.target.value)}
            placeholder="0"
          />
          <InputWithIcon
            label="Pedidos Ya Wafix"
            icon={<Bike className="w-4 h-4" />}
            value={sales.pedidosYaWafix || ''}
            onChange={(e) => handleInputChange("pedidosYaWafix", e.target.value)}
            placeholder="0"
          />
          <InputWithIcon
            label="Pedidos Ya Mix"
            icon={<Bike className="w-4 h-4" />}
            value={sales.pedidosYaMix || ''}
            onChange={(e) => handleInputChange("pedidosYaMix", e.target.value)}
            placeholder="0"
          />
          <InputWithIcon
            label="Uber Eats"
            icon={<Bike className="w-4 h-4" />}
            value={sales.uberEats || ''}
            onChange={(e) => handleInputChange("uberEats", e.target.value)}
            placeholder="0"
          />
          <InputWithIcon
            label="Junaeb"
            icon={<School2 className="w-4 h-4" />}
            value={sales.junaeb || ''}
            onChange={(e) => handleInputChange("junaeb", e.target.value)}
            placeholder="0"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Efectivo en Caja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {denominations.map((d) => (
            <div key={d.key} className="flex items-center justify-between gap-2">
                <Label htmlFor={d.key} className="text-sm font-normal flex-1">{d.label}</Label>
                <div className="flex items-center gap-2">
                    <Input
                    id={d.key}
                    type="number"
                    value={cashBreakdown[d.key] || ''}
                    onChange={(e) => handleBreakdownChange(d.key, e.target.value)}
                    placeholder="0"
                    className="w-20 h-9 text-right"
                    min="0"
                    step="1"
                    />
                    <span className="w-24 text-right font-mono text-sm text-muted-foreground">
                        {formatCurrency(cashBreakdown[d.key] * d.value)}
                    </span>
                </div>
            </div>
            ))}
            <Separator className="my-4" />
            <div className="flex items-center justify-between font-bold text-lg">
                <span>Total Contado</span>
                <span>{formatCurrency(totalCashInBox)}</span>
            </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-4 flex justify-end gap-2">
        <Button variant="outline" onClick={resetForm}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reiniciar
        </Button>
        <Button variant="secondary" onClick={shareViaWhatsApp}>
          <Share className="mr-2 h-4 w-4" />
          Compartir
        </Button>
        <Button variant="secondary" onClick={generatePDF}>
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar
        </Button>
      </div>
    </div>
  );
}
