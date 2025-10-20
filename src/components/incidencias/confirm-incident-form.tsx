"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { confirmIncidentAction, type ConfirmResult } from "@/app/(platform)/incidents/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { INCIDENT_STATUSES, type IncidentStatus } from "@/constants/incidents";

type Props = {
  code: string;
  initialStatus: IncidentStatus;
  initialResolutionNotes?: string | null;
  initialConfirmedBy?: string | null;
};

const initialState: ConfirmResult = {
  ok: false
};

export function ConfirmIncidentForm({
  code,
  initialStatus,
  initialResolutionNotes,
  initialConfirmedBy
}: Props) {
  const [state, formAction] = useActionState(confirmIncidentAction, initialState);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<IncidentStatus>(initialStatus);
  const [resolutionNotes, setResolutionNotes] = useState<string>(initialResolutionNotes ?? "");
  const [confirmedBy, setConfirmedBy] = useState<string>(initialConfirmedBy ?? "");

  useEffect(() => {
    if (!state) return;
    if (state.status) {
      setStatus(state.status);
    }
    if (state.resolution_notes !== undefined) {
      setResolutionNotes(state.resolution_notes ?? "");
    }
    if (state.confirmed_by !== undefined) {
      setConfirmedBy(state.confirmed_by ?? "");
    }
  }, [state]);

  const handleAction = (formData: FormData) => {
    formData.set("code", code);
    formData.set("status", status);
    formData.set("resolution_notes", resolutionNotes);
    formData.set("confirmed_by", confirmedBy);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form action={handleAction} className="flex flex-col gap-6 rounded-3xl border border-border bg-white/80 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as IncidentStatus)} name="status">
            <SelectTrigger id="status" className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCIDENT_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmed_by">Responsable de la confirmacion</Label>
          <Input
            id="confirmed_by"
            name="confirmed_by"
            placeholder="Nombre y apellido"
            value={confirmedBy}
            onChange={(event) => setConfirmedBy(event.target.value)}
            className="rounded-xl"
          />
          {status === "Resuelto" && (
            <p className="text-xs text-muted-foreground">Obligatorio al cerrar la incidencia como resuelta.</p>
          )}
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="resolution_notes">Observaciones finales</Label>
          <Textarea
            id="resolution_notes"
            name="resolution_notes"
            rows={4}
            value={resolutionNotes}
            onChange={(event) => setResolutionNotes(event.target.value)}
            placeholder="Describe brevemente el trabajo realizado o pasos de seguimiento."
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            Esta informacion aparecera en los reportes y comprobantes de atencion.
          </p>
        </div>
      </div>

      {state?.message && (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-destructive"}`}>{state.message}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" className="rounded-xl px-6" disabled={isPending}>
          {isPending ? "Guardando..." : "Actualizar y confirmar"}
        </Button>
      </div>
    </form>
  );
}
