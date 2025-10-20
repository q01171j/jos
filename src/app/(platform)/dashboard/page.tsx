import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StatusCard } from "@/components/incidencias/status-card";
import { WeeklyDistributionChart } from "@/components/incidencias/weekly-distribution-chart";
import { StatusDonutChart } from "@/components/incidencias/status-donut-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WEEKDAY_LABELS, getLastNDaysRange, getMonthBoundsFromInput, getWeekdayIndexFromISO } from "@/lib/date-utils";

type SummaryRow = {
  status: "Pendiente" | "En proceso" | "Resuelto";
  total: number;
};

type RecentIncident = {
  code: string;
  user_name: string;
  created_at: string | null;
  status: "Pendiente" | "En proceso" | "Resuelto";
  areas: { name: string } | null;
  technicians: { full_name: string | null } | null;
};

type WeeklyPoint = {
  label: string;
  value: number;
};

async function fetchSummary(): Promise<SummaryRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("dashboard_summary").select("status,total");
  if (error) {
    console.error(error);
    return [];
  }
  return (data as SummaryRow[]) ?? [];
}

async function fetchRecentIncidents(): Promise<RecentIncident[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("code,user_name,created_at,status,areas(name),technicians(full_name)")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) {
    console.error(error);
    return [];
  }
  return (data as RecentIncident[]) ?? [];
}

async function fetchWeeklyDistribution(): Promise<WeeklyPoint[]> {
  const supabase = createServerSupabaseClient();
  const { start, end } = getLastNDaysRange(7);

  const { data, error } = await supabase
    .from("incidents")
    .select("created_at")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  if (error) {
    console.error(error);
  }

  const counts = Array.from({ length: WEEKDAY_LABELS.length }, () => 0);

  (data ?? []).forEach((incident: { created_at: string | null }) => {
    if (!incident.created_at) return;
    const index = getWeekdayIndexFromISO(incident.created_at);
    if (index >= 0) {
      counts[index] += 1;
    }
  });

  return WEEKDAY_LABELS.map((label, index) => ({
    label,
    value: counts[index] ?? 0
  }));
}

async function fetchMonthlyStatusTotals(): Promise<Record<SummaryRow["status"], number>> {
  const supabase = createServerSupabaseClient();
  const { start, end } = getMonthBoundsFromInput();

  const { data, error } = await supabase
    .from("incidents")
    .select("status")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  if (error) {
    console.error(error);
  }

  const totals: Record<SummaryRow["status"], number> = {
    Pendiente: 0,
    "En proceso": 0,
    Resuelto: 0
  };

  (data ?? []).forEach((row: { status: SummaryRow["status"] }) => {
    if (row.status in totals) {
      totals[row.status] += 1;
    }
  });

  return totals;
}

export default async function DashboardPage() {
  const [summary, incidents, weeklyDistribution, monthlyStatusTotals] = await Promise.all([
    fetchSummary(),
    fetchRecentIncidents(),
    fetchWeeklyDistribution(),
    fetchMonthlyStatusTotals()
  ]);

  const summaryTotals = summary.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item.total;
    return acc;
  }, {});

  const statusTotals = {
    Pendiente: monthlyStatusTotals.Pendiente ?? 0,
    "En proceso": monthlyStatusTotals["En proceso"] ?? 0,
    Resuelto: monthlyStatusTotals.Resuelto ?? 0
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Resumen de incidencias</h1>
        <p className="text-sm text-muted-foreground">Panel general del estado operativo</p>
      </header>

      <section className="grid gap-6 xl:grid-cols-3">
        <StatusCard status="Pendiente" total={summaryTotals["Pendiente"] ?? 0} />
        <StatusCard status="En proceso" total={summaryTotals["En proceso"] ?? 0} />
        <StatusCard status="Resuelto" total={summaryTotals["Resuelto"] ?? 0} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <WeeklyDistributionChart
          title="Distribucion semanal"
          subtitle="Incidencias registradas por dia"
          data={weeklyDistribution}
        />
        <StatusDonutChart
          title="Incidencias por estado"
          subtitle="Corte mensual"
          data={[
            { label: "Resueltas", value: statusTotals.Resuelto, color: "#10b981" },
            { label: "En proceso", value: statusTotals["En proceso"], color: "#2563eb" },
            { label: "Pendientes", value: statusTotals.Pendiente, color: "#ef4444" }
          ]}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Ultimos tickets</h2>
          <p className="text-sm text-muted-foreground">Seguimiento de las incidencias recien gestionadas</p>
        </div>
        <Card className="border-none shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando incidencias...</p>}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Numero</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tecnico</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                        No hay incidencias registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    incidents.map((incident) => (
                      <TableRow key={incident.code}>
                        <TableCell className="font-medium">{incident.code}</TableCell>
                        <TableCell>{incident.user_name}</TableCell>
                        <TableCell>{incident.areas?.name ?? "-"}</TableCell>
                        <TableCell>
                          {incident.created_at
                            ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(
                                new Date(incident.created_at)
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>{incident.technicians?.full_name ?? "Sin asignar"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              incident.status === "Resuelto"
                                ? "secondary"
                                : incident.status === "En proceso"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {incident.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
