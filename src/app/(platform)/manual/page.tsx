import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ManualPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Manual rapido</h1>
        <p className="text-sm text-muted-foreground">
          Buenas practicas para registrar, gestionar y cerrar incidencias en la Municipalidad Provincial de Huancayo.
        </p>
      </header>

      <Card className="border-none bg-white shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">1. Registro de incidencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            El formulario <Badge className="ml-1 align-middle">Registrar incidencia</Badge> solicita la informacion
            basica del ciudadano atendido. Completa los campos obligatorios y asigna un tecnico si corresponde. Al
            guardar se genera automaticamente un codigo con el formato <strong>INC-AAAA-###</strong>.
          </p>
          <p>
            Si necesitas editar la informacion luego del registro, ingresa a{" "}
            <Link href="/incidents" className="font-medium text-primary">
              Consultar incidencias
            </Link>{" "}
            y abre el ticket para actualizarlo.
          </p>
        </CardContent>
      </Card>

      <Card className="border-none bg-white shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">2. Seguimiento operativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Desde la tabla de incidencias puedes cambiar el estado rapidamente entre{" "}
            <Badge variant="destructive" className="mx-1">
              Pendiente
            </Badge>
            ,
            <Badge variant="default" className="mx-1">
              En proceso
            </Badge>{" "}
            y{" "}
            <Badge variant="secondary" className="mx-1">
              Resuelto
            </Badge>
            . El dashboard se actualiza automaticamente y conserva un historial semanal de atenciones.
          </p>
          <p>
            Usa las opciones de exportacion (PDF o Excel) para compartir reportes con otras gerencias o registrar la
            atencion en mesa de partes.
          </p>
        </CardContent>
      </Card>

      <Card className="border-none bg-white shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">3. Cierre y conformidad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Para cerrar un ticket dirígete a la pantalla de confirmacion y registra las observaciones finales. Incluye
            el responsable de la conformidad para que quede almacenado en el expediente.
          </p>
          <p>
            Si existe alguna duda o incidente critico, comunicate con el equipo de Tecnologia de la Informacion para
            validar la informacion registrada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
