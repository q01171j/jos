"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createUserAction, type CreateUserState } from "@/app/(platform)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const INITIAL_STATE: CreateUserState = {
  ok: true,
  message: ""
};

export function CreateUserForm() {
  const [state, formAction] = useActionState<CreateUserState, FormData>(createUserAction, INITIAL_STATE);

  return (
    <form action={formAction} className="grid gap-4 rounded-3xl bg-white p-6 shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Correo institucional</Label>
          <Input id="email" name="email" type="email" placeholder="usuario@huancayo.gob.pe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña temporal</Label>
          <Input id="password" name="password" type="password" minLength={8} placeholder="Minimo 8 caracteres" required />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">Rol operativo</Label>
          <Select name="role" defaultValue="Operador" required>
            <SelectTrigger id="role" className="rounded-xl">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administrador">Administrador</SelectItem>
              <SelectItem value="Operador">Operador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select name="status" defaultValue="Activo" required>
            <SelectTrigger id="status" className="rounded-xl">
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {state.message ? (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="rounded-xl" disabled={pending}>
      {pending ? "Creando usuario..." : "Registrar usuario"}
    </Button>
  );
}
