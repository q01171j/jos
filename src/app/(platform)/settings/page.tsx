import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("system_users").select("id,username,role,status").order("username");

  if (error) {
    console.error(error);
  }

  const users = data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Configuracion / Usuarios</h1>
        <p className="text-sm text-muted-foreground">Gestiona los accesos y permisos del sistema</p>
      </header>

      <div className="flex justify-end">
        <Button className="rounded-xl">Agregar nuevo usuario</Button>
      </div>

      <div className="rounded-3xl bg-white p-0 shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Activo" ? "secondary" : "destructive"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-3">
                      <Button variant="link" className="px-0 text-sm font-semibold text-primary">
                        Editar
                      </Button>
                      <Button variant="link" className="px-0 text-sm font-semibold text-destructive">
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">* Visible solo para perfiles administradores.</p>
    </div>
  );
}
