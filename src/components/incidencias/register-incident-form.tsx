"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createIncidentAction, type ActionResult } from "@/app/(platform)/incidents/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type Option = {
  id: string;
  name: string;
};

type Props = {
  areas: Option[];
  technicians: Option[];
  defaultStatus: "Pendiente" | "En proceso" | "Resuelto";
  currentDate: string;
};

const initialFormState: ActionResult = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="h-11 rounded-xl text-sm font-semibold" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  );
}

export function RegisterIncidentForm({ areas, technicians, defaultStatus, currentDate }: Props) {
  const [state, formAction] = useActionState(createIncidentAction, initialFormState);
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  useEffect(() => {
    if (state.ok && state.code) {
      setTicket(state.code);
      setOpen(true);
    }
  }, [state]);

  return (
    <>
      <Card className="border-none bg-white shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
        <CardContent className="p-8">
          <form action={formAction} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user_name">Nombre del usuario atendido</Label>
              <Input id="user_name" name="user_name" placeholder="Ej. Juan Perez" required />
              {state.issues?.user_name && (
                <p className="text-xs text-destructive">{state.issues.user_name.join(", ")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_id">Area o dependencia</Label>
              <Select name="area_id">
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Selecciona un area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.issues?.area_id && (
                <p className="text-xs text-destructive">{state.issues.area_id.join(", ")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-date">Fecha de registro</Label>
              <Input
                id="register-date"
                value={format(new Date(currentDate), "dd/MM/yyyy", { locale: es })}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technician_id">Tecnico asignado</Label>
              <Select name="technician_id" defaultValue="none">
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Selecciona un tecnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripcion de la incidencia</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detalla el problema reportado"
                required
                className="min-h-32 rounded-xl"
              />
              {state.issues?.description && (
                <p className="text-xs text-destructive">{state.issues.description.join(", ")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select name="status" defaultValue={defaultStatus}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En proceso">En proceso</SelectItem>
                  <SelectItem value="Resuelto">Resuelto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observaciones</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Comentarios adicionales"
                className="min-h-28 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl text-sm font-medium"
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
              <SubmitButton />
            </div>

            {state.message && !state.ok && (
              <p className="md:col-span-2 text-sm text-destructive">{state.message}</p>
            )}
          </form>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Ticket generado</DialogTitle>
            <DialogDescription>
              Se registro la incidencia con el codigo <strong>{ticket}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setOpen(false);
                setTicket(null);
              }}
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
