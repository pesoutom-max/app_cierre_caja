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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
  const [sales, setSales] = React.useState<SalesData>(initialSalesData);
  const [cashBreakdown, setCashBreakdown] = React.useState<CashBreakdown>(initialCashBreakdown);
  
  const [totalSales, setTotalSales] = React.useState(0);
  const [expectedCash, setExpectedCash] = React.useState(0);
  const [totalCashInBox, setTotalCashInBox] = React.useState(0);
  const [difference, setDifference] = React.useState(0);

  const [isCalculating, setIsCalculating] = React.useState(false);

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
    const { b20000, b10000, b5000, b2000, b1000, m500, m100, m50 } = cashBreakdown;
    const total =
      (b20000 || 0) * 20000 +
      (b10000 || 0) * 10000 +
      (b5000 || 0) * 5000 +
      (b2000 || 0) * 2000 +
      (b1000 || 0) * 1000 +
      (m500 || 0) * 500 +
      (m100 || 0) * 100 +
      (m50 || 0) * 50;
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Resumen del Día</CardTitle>
          <CardDescription>Totales calculados en base a los datos ingresados.</CardDescription>
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

      <div className="lg:col-span-4 flex justify-end">
        <Button variant="outline" onClick={resetForm}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reiniciar
        </Button>
      </div>
    </div>
  );
}
