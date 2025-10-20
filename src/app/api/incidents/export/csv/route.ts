import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("code,user_name,status,created_at,areas(name),technicians(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo generar el reporte." }, { status: 500 });
  }

  const header = ["Codigo", "Usuario", "Area", "Estado", "Tecnico", "Fecha de registro"];

  const rows = (data ?? []).map((incident) => [
    incident.code,
    incident.user_name,
    incident.areas?.name ?? "-",
    incident.status,
    incident.technicians?.full_name ?? "Sin asignar",
    incident.created_at
      ? new Date(incident.created_at).toISOString()
      : ""
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="incidencias.csv"'
    }
  });
}
