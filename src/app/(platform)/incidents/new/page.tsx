import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RegisterIncidentForm } from "@/components/incidencias/register-incident-form";

export default async function NewIncidentPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: areasData }, { data: techniciansData }] = await Promise.all([
    supabase.from("areas").select("id,name").order("name"),
    supabase.from("technicians").select("id,full_name").order("full_name")
  ]);

  const areas =
    areasData?.map((area) => ({
      id: area.id,
      name: area.name
    })) ?? [];

  const technicians =
    techniciansData?.map((tech) => ({
      id: tech.id,
      name: tech.full_name
    })) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Registrar incidencia</h1>
        <p className="text-sm text-muted-foreground">
          Completa la informacion para generar un nuevo ticket
        </p>
      </header>

      <RegisterIncidentForm
        areas={areas}
        technicians={technicians}
        defaultStatus="Pendiente"
        currentDate={new Date().toISOString()}
      />
    </div>
  );
}
