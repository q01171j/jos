"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateUserRoleStatusAction, type UpdateUserState } from "@/app/(platform)/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type UpdateUserInlineFormProps = {
  userId: string;
  currentRole: "Administrador" | "Operador";
  currentStatus: "Activo" | "Inactivo";
};

const INITIAL_STATE: UpdateUserState = {
  ok: true,
  message: ""
};

export function UpdateUserInlineForm({
  userId,
  currentRole,
  currentStatus
}: UpdateUserInlineFormProps) {
  const [state, formAction] = useActionState<UpdateUserState, FormData>(updateUserRoleStatusAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex items-center justify-end gap-3">
      <input type="hidden" name="userId" value={userId} />
      <Select name="role" defaultValue={currentRole}>
        <SelectTrigger className="h-9 w-32 rounded-xl text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Administrador">Administrador</SelectItem>
          <SelectItem value="Operador">Operador</SelectItem>
        </SelectContent>
      </Select>

      <Select name="status" defaultValue={currentStatus}>
        <SelectTrigger className="h-9 w-28 rounded-xl text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Activo">Activo</SelectItem>
          <SelectItem value="Inactivo">Inactivo</SelectItem>
        </SelectContent>
      </Select>

      <SubmitButton />

      {!state.ok && state.message ? (
        <span className="text-xs font-medium text-destructive">{state.message}</span>
      ) : null}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" className="rounded-xl" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  );
}
