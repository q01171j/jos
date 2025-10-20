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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { IncidentStatusSelector } from "@/components/incidencias/incident-status-selector";
import { INCIDENT_STATUSES, type IncidentStatus } from "@/constants/incidents";

type SearchParams = {
  fecha?: string;
  area?: string;
  estado?: string;
  tecnico?: string;
};

const ALL_OPTION = "all";

export const dynamic = "force-dynamic";

export default async function IncidentsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createServerSupabaseClient();

  const [{ data: areasData }, { data: techniciansData }] = await Promise.all([
    supabase.from("areas").select("id,name").order("name"),
    supabase.from("technicians").select("id,full_name").order("full_name")
  ]);

  const filters = {
    fecha: searchParams.fecha ?? "",
    area: searchParams.area ?? ALL_OPTION,
    estado: searchParams.estado ?? ALL_OPTION,
    tecnico: searchParams.tecnico ?? ALL_OPTION
  };

  let query = supabase
    .from("incidents")
    .select("code,user_name,area_id,created_at,status,areas(name),technicians(full_name)")
    .order("created_at", { ascending: false });

  if (filters.area !== ALL_OPTION) {
    query = query.eq("area_id", filters.area);
  }
  if (filters.estado !== ALL_OPTION) {
    query = query.eq("status", filters.estado);
  }
  if (filters.tecnico !== ALL_OPTION) {
    query = query.eq("technician_id", filters.tecnico);
  }
  if (filters.fecha) {
    const date = new Date(filters.fecha);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    query = query.gte("created_at", date.toISOString()).lt("created_at", nextDay.toISOString());
  }

  const { data: incidentsData, error } = await query;
  if (error) {
    console.error(error);
  }

  const incidents = incidentsData ?? [];

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Consultar incidencias</h1>
        <p className="text-sm text-muted-foreground">Filtra y revisa los tickets registrados</p>
      </header>

      <form className="grid gap-4 rounded-3xl bg-white p-6 shadow-[0_18px_42px_rgba(12,35,64,0.08)] md:grid-cols-4">
        <div className="space-y-2">
          <label htmlFor="fecha" className="text-sm font-medium text-foreground">
            Fecha
          </label>
          <Input id="fecha" name="fecha" type="date" defaultValue={filters.fecha} className="rounded-xl" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Area</label>
          <Select name="area" defaultValue={filters.area}>
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
          <label className="text-sm font-medium text-foreground">Estado</label>
          <Select name="estado" defaultValue={filters.estado}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
                  <SelectItem value={ALL_OPTION}>Todos</SelectItem>
              {INCIDENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tecnico</label>
          <Select name="tecnico" defaultValue={filters.tecnico}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION}>Todos</SelectItem>
              {techniciansData?.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-4 flex items-center justify-end gap-3 pt-2">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/incidents" className="no-underline">
            Limpiar
          </Link>
        </Button>
          <Button type="submit" className="rounded-xl">
            Aplicar filtros
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="secondary" className="rounded-xl">
          <a href="/api/incidents/export/pdf" download>
            Exportar PDF
          </a>
        </Button>
        <Button asChild variant="secondary" className="rounded-xl">
          <a href="/api/incidents/export/csv" download>
            Exportar Excel
          </a>
        </Button>
      </div>

      <div className="rounded-3xl bg-white p-0 shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Numero</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tecnico</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No se encontraron incidencias con los filtros seleccionados.
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
                    <IncidentStatusSelector
                      code={incident.code}
                      initialStatus={incident.status as IncidentStatus}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="link" className="px-0 text-sm font-semibold text-primary">
                      <Link href={`/incidents/${incident.code}/confirm`}>Ver detalles</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

