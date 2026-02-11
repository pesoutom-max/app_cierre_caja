import CajaForm from "@/components/caja-form";

export default function Home() {
  return (
    <div className="bg-background min-h-dvh w-full">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
            Cierre de Caja
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Introduce los valores del día para generar el reporte de ventas y el balance de efectivo esperado en caja.
          </p>
        </header>
        <CajaForm />
      </main>
      <footer className="text-center py-4 text-muted-foreground text-sm">
        <p>Diseñado para una gestión de caja eficiente.</p>
      </footer>
    </div>
  );
}
