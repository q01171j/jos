"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { deleteUserAction, type DeleteUserState } from "@/app/(platform)/settings/actions";
import { Button } from "@/components/ui/button";

type DeleteUserButtonProps = {
  userId: string;
  currentUserId?: string;
};

const INITIAL_STATE: DeleteUserState = {
  ok: true,
  message: ""
};

export default function DeleteUserButton({ userId, currentUserId }: DeleteUserButtonProps) {
  const [state, formAction] = useActionState<DeleteUserState, FormData>(deleteUserAction, INITIAL_STATE);
  const disabled = !currentUserId || currentUserId === userId;

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="currentUserId" value={currentUserId ?? ""} />
      <SubmitButton disabled={disabled} />
      {state.ok || !state.message ? null : (
        <span className="text-xs font-semibold text-destructive">{state.message}</span>
      )}
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      className="rounded-xl"
      disabled={disabled || pending}
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </Button>
  );
}
