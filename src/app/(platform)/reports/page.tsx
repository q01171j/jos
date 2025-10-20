import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { WeeklyDistributionChart } from "@/components/incidencias/weekly-distribution-chart";
import { StatusDonutChart } from "@/components/incidencias/status-donut-chart";
import { WEEKDAY_LABELS, getMonthBoundsFromInput, getWeekdayIndexFromISO } from "@/lib/date-utils";

type SearchParams = {
  fecha?: string;
  area?: string;
  tipo?: "mensual" | "semanal" | "personalizado";
};

const REPORT_TYPES = ["mensual", "semanal", "personalizado"] as const;
const ALL_OPTION = "all";

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createServerSupabaseClient();

  const rawType = searchParams.tipo;
  const selectedType: (typeof REPORT_TYPES)[number] =
    rawType && REPORT_TYPES.includes(rawType as (typeof REPORT_TYPES)[number])
      ? (rawType as (typeof REPORT_TYPES)[number])
      : "mensual";

  const { start: monthStart, end: monthEnd, inputValue } = getMonthBoundsFromInput(searchParams.fecha);
  const monthInputValue = inputValue;

  const { start: rangeStart, end: rangeEnd } =
    selectedType === "semanal"
      ? (() => {
          const end = new Date();
          const start = new Date(end);
          start.setHours(0, 0, 0, 0);
          start.setDate(start.getDate() - 6);
          return { start, end };
        })()
      : { start: monthStart, end: monthEnd };

  const selectedArea = searchParams.area ?? ALL_OPTION;

  const areasPromise = supabase.from("areas").select("id,name").order("name");

  let incidentsQuery = supabase
    .from("incidents")
    .select("status,created_at,area_id")
    .gte("created_at", rangeStart.toISOString());

  if (selectedType === "semanal") {
    incidentsQuery = incidentsQuery.lte("created_at", rangeEnd.toISOString());
  } else {
    incidentsQuery = incidentsQuery.lt("created_at", rangeEnd.toISOString());
  }

  if (selectedArea !== ALL_OPTION) {
    incidentsQuery = incidentsQuery.eq("area_id", selectedArea);
  }

  const [{ data: areasData }, { data: incidentsData, error: incidentsError }] = await Promise.all([
    areasPromise,
    incidentsQuery
  ]);

  if (incidentsError) {
    console.error(incidentsError);
  }

  const statusMap = {
    Pendiente: 0,
    "En proceso": 0,
    Resuelto: 0
  };

  const weeklyCounts = Array.from({ length: WEEKDAY_LABELS.length }, () => 0);

  (incidentsData ?? []).forEach((incident) => {
    if (!incident.created_at) return;
    if (incident.status in statusMap) {
      statusMap[incident.status as keyof typeof statusMap] += 1;
    }
    const index = getWeekdayIndexFromISO(incident.created_at);
    if (index >= 0) {
      weeklyCounts[index] += 1;
    }
  });

  const donutSubtitle =
    selectedType === "semanal" ? "Corte de los ultimos 7 dias" : "Resumen del periodo seleccionado";
  const weeklySubtitle =
    selectedType === "semanal" ? "Actividad diaria (ultimos 7 dias)" : "Registros diarios segun el periodo seleccionado";

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Reportes automaticos</h1>
        <p className="text-sm text-muted-foreground">
          Visualiza el rendimiento operativo por periodo y genera reportes instantaneos
        </p>
      </header>

      <form className="grid gap-4 rounded-3xl bg-white p-6 shadow-[0_18px_42px_rgba(12,35,64,0.08)] md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Fecha</label>
          <Input name="fecha" type="month" defaultValue={monthInputValue} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Area</label>
          <Select name="area" defaultValue={selectedArea}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION}>Todas</SelectItem>
              {areasData?.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tipo</label>
          <Select name="tipo" defaultValue={selectedType ?? "mensual"}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensual">Mensual</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3 flex items-center justify-end gap-3 pt-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/reports" className="no-underline">
              Limpiar
            </Link>
          </Button>
          <Button type="submit" className="rounded-xl">
            Actualizar datos
          </Button>
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusDonutChart
          title="Incidencias por estado"
          subtitle={donutSubtitle}
          data={[
            { label: "Resueltas", value: statusMap["Resuelto"], color: "#10b981" },
            { label: "En proceso", value: statusMap["En proceso"], color: "#2563eb" },
            { label: "Pendientes", value: statusMap["Pendiente"], color: "#ef4444" }
          ]}
        />
        <WeeklyDistributionChart
          title="Distribucion semanal"
          subtitle={weeklySubtitle}
          data={WEEKDAY_LABELS.map((label, index) => ({
            label,
            value: weeklyCounts[index]
          }))}
        />
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
        <h2 className="text-lg font-semibold text-foreground">Resumen ejecutivo</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            Pendientes: <span className="font-semibold text-foreground">{statusMap["Pendiente"]}</span>
          </li>
          <li>
            En proceso: <span className="font-semibold text-foreground">{statusMap["En proceso"]}</span>
          </li>
          <li>
            Resueltas: <span className="font-semibold text-foreground">{statusMap["Resuelto"]}</span>
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl">
            <a href="/api/incidents/export/pdf" download>
              Generar PDF
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <a href="/api/incidents/export/csv" download>
              Descargar Excel
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
