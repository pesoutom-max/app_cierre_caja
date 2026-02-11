"use client";

import * as React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
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
  RotateCcw
} from "lucide-react";

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

export default function CajaForm() {
  const [sales, setSales] = React.useState<SalesData>(initialSalesData);
  const [totalSales, setTotalSales] = React.useState(0);
  const [expectedCash, setExpectedCash] = React.useState(0);
  const [isCalculating, setIsCalculating] = React.useState(false);

  const handleInputChange = (field: keyof SalesData, value: string) => {
    const numericValue = parseInt(value, 10);
    setSales((prev) => ({
      ...prev,
      [field]: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const resetForm = () => {
    setSales(initialSalesData);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Resumen del Día</CardTitle>
          <CardDescription>Totales calculados en base a los datos ingresados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-lg bg-primary/10 border-2 border-dashed border-primary transition-all duration-300 ${isCalculating ? 'border-accent shadow-lg shadow-accent/20' : 'border-primary'}`}>
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
      <div className="lg:col-span-3 flex justify-end">
        <Button variant="outline" onClick={resetForm}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reiniciar
        </Button>
      </div>
    </div>
  );
}
