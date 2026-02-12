'use client';

import CajaForm from "@/components/caja-form";
import ReportesList from "@/components/reportes-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="bg-background min-h-dvh w-full">
      <main className="container mx-auto px-2 sm:px-4 py-8 md:py-12">
        <header className="relative text-center mb-8 md:mb-12">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline text-primary">
            Cierre de Caja
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Usa la pestaña "Cierre de Caja" para los valores del día y "Reportes" para ver el historial.
          </p>
        </header>

        <Tabs defaultValue="cierre" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cierre">Cierre de Caja</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>
          <TabsContent value="cierre" className="pt-6">
            <CajaForm />
          </TabsContent>
          <TabsContent value="reportes" className="pt-6">
            <ReportesList />
          </TabsContent>
        </Tabs>

      </main>
      <footer className="text-center py-4 text-muted-foreground text-sm">
        <p>Diseñado para una gestión de caja eficiente.</p>
      </footer>
    </div>
  );
}
