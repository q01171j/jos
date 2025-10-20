import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ConfirmIncidentForm } from "@/components/incidencias/confirm-incident-form";
import { IncidentStatus } from "@/constants/incidents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  params: {
    code: string;
  };
};

export default async function ConfirmIncidentPage({ params }: Props) {
  const supabase = await createServerSupabaseClient();

  const {
    data: primaryData,
    error: primaryError
  } = await supabase
    .from("incidents")
    .select("code,user_name,description,notes,resolution_notes,confirmed_by,confirmed_at,status,created_at,areas(name),technicians(full_name)")
    .eq("code", params.code)
    .maybeSingle();

  let data = primaryData as (typeof primaryData & {
    resolution_notes?: string | null;
    confirmed_by?: string | null;
    confirmed_at?: string | null;
  }) | null;
  let error = primaryError;

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("incidents")
      .select("code,user_name,description,notes,status,created_at,areas(name),technicians(full_name)")
      .eq("code", params.code)
      .maybeSingle();

    if (fallbackData) {
      data = {
        ...fallbackData,
        resolution_notes: null,
        confirmed_by: null,
        confirmed_at: null
      };
      error = null;
    } else {
      error = fallbackError ?? error;
    }
  }

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Confirmacion / Firma digital</h1>
        <p className="text-sm text-muted-foreground">
          Verifica la informacion registrada antes de confirmar la conformidad
        </p>
      </header>

      <Card className="rounded-3xl border-none bg-white shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Detalle del ticket {data.code}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Usuario</p>
            <p className="text-base font-medium text-foreground">{data.user_name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Area</p>
            <p className="text-base font-medium text-foreground">{data.areas?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Fecha de registro</p>
            <p className="text-base font-medium text-foreground">
              {data.created_at
                ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(data.created_at))
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Tecnico asignado</p>
            <p className="text-base font-medium text-foreground">{data.technicians?.full_name ?? "Sin asignar"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Descripcion</p>
            <p className="text-base text-foreground">{data.description}</p>
          </div>
          {data.notes && (
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Observaciones</p>
              <p className="text-base text-foreground">{data.notes}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Estado</p>
            <p className="text-base font-medium text-foreground">{data.status}</p>
          </div>

        </CardContent>
      </Card>

      <ConfirmIncidentForm
        code={data.code}
        initialStatus={data.status as IncidentStatus}
        initialResolutionNotes={data.resolution_notes}
        initialConfirmedBy={data.confirmed_by}
      />
    </div>
  );
}
