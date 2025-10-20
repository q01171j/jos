import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
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
import { CreateUserForm } from "@/components/settings/create-user-form";
import { UpdateUserInlineForm } from "@/components/settings/update-user-inline-form";
import DeleteUserButton from "@/components/settings/delete-user-button";

export default async function SettingsPage() {
  const supabase = createServiceRoleSupabaseClient();
  const serverClient = await createServerSupabaseClient();
  const {
    data: { user: currentUser }
  } = await serverClient.auth.getUser();

  const { data: systemUsers, error: systemUsersError } = await supabase
    .from("system_users")
    .select("id,username,role,status,created_at")
    .order("username");

  if (systemUsersError) {
    console.error(systemUsersError);
  }

  const { data: authList, error: authUsersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100
  });

  if (authUsersError) {
    console.error(authUsersError);
  }

  const users = systemUsers ?? [];
  const authUsers = authList?.users ?? [];

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Configuracion / Usuarios</h1>
        <p className="text-sm text-muted-foreground">Gestiona los accesos y permisos del sistema</p>
      </header>

      <CreateUserForm />

      <div className="rounded-3xl bg-white p-0 shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Usuarios internos</h2>
          <p className="text-sm text-muted-foreground">Registros sincronizados con la tabla `system_users`.</p>
        </div>
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
                    <div className="flex items-center justify-end gap-3">
                      <UpdateUserInlineForm userId={user.id} currentRole={user.role} currentStatus={user.status} />
                      <DeleteUserButton userId={user.id} currentUserId={currentUser?.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-3xl bg-white p-0 shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Usuarios autenticados</h2>
          <p className="text-sm text-muted-foreground">Listado directo de cuentas en Supabase Auth.</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registrado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No se encontraron usuarios en Supabase Auth.
                </TableCell>
              </TableRow>
            ) : (
              authUsers.map((user) => {
                const statusLabel =
                  (user.user_metadata?.status as string | undefined) ?? (user.email_confirmed_at ? "Activo" : "Pendiente");
                const statusVariant = statusLabel === "Inactivo" ? "destructive" : "secondary";

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email ?? "Sin correo"}</TableCell>
                    <TableCell>{(user.user_metadata?.role as string | undefined) ?? "Sin asignar"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(
                            new Date(user.created_at)
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        * Operaciones disponibles para perfiles administradores. Comparte la contraseña temporal de manera segura con el colaborador.
      </p>
    </div>
  );
}
