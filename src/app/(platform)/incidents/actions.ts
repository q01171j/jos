
"use server";

import { z } from "zod";
import { createActionClient } from "@/lib/supabase/actions";
import { revalidatePath } from "next/cache";
import { INCIDENT_STATUSES, type IncidentStatus } from "@/constants/incidents";

const schema = z.object({
  user_name: z.string().min(3),
  area_id: z.string().uuid(),
  technician_id: z.string().uuid().nullable(),
  status: z.enum(INCIDENT_STATUSES),
  description: z.string().min(10),
  notes: z.string().optional()
});

function generateFallbackCode() {
  const now = new Date();
  const random = (Math.floor(Math.random() * 900) + 100).toString().padStart(3, "0");
  return `INC-${now.getFullYear()}-${random}`;
}

export type ActionResult = {
  ok: boolean;
  code?: string;
  message?: string;
  issues?: Record<string, string[] | undefined>;
};

export async function createIncidentAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const technicianValue = raw.technician_id ? String(raw.technician_id) : null;
  const sanitizedTechnicianId = technicianValue && technicianValue !== "none" ? technicianValue : null;

  const parsed = schema.safeParse({
    user_name: raw.user_name,
    area_id: raw.area_id,
    technician_id: sanitizedTechnicianId,
    status: raw.status,
    description: raw.description,
    notes: raw.notes ? String(raw.notes) : undefined
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos obligatorios.",
      issues: parsed.error.flatten().fieldErrors
    };
  }

  const supabase = await createActionClient();

  const { data: rpcData } = await supabase.rpc("incident_code_sequence");
  const generatedCode = rpcData ?? generateFallbackCode();

  const { data, error } = await supabase
    .from("incidents")
    .insert({
      code: generatedCode,
      user_name: parsed.data.user_name,
      area_id: parsed.data.area_id,
      technician_id: parsed.data.technician_id,
      status: parsed.data.status,
      description: parsed.data.description,
      notes: parsed.data.notes ?? null
    })
    .select("code")
    .single();

  if (error) {
    console.error(error);
    return {
      ok: false,
      message: "No se pudo registrar la incidencia. Intentalo nuevamente."
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/incidents");

  return {
    ok: true,
    code: data?.code ?? generatedCode
  };
}

export type ConfirmResult = {
  ok: boolean;
  message?: string;
  status?: IncidentStatus;
  resolution_notes?: string | null;
  confirmed_by?: string | null;
};

const confirmationSchema = z.object({
  code: z.string().min(1),
  status: z.enum(INCIDENT_STATUSES),
  resolution_notes: z
    .string()
    .max(500)
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : null)),
  confirmed_by: z
    .string()
    .max(120)
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : null))
});

export async function confirmIncidentAction(
  _: ConfirmResult,
  formData: FormData
): Promise<ConfirmResult> {
  const parsed = confirmationSchema.safeParse({
    code: formData.get("code"),
    status: (formData.get("status") ?? "Resuelto") as string,
    resolution_notes: formData.get("resolution_notes"),
    confirmed_by: formData.get("confirmed_by")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Datos invalidos. Revisa la informacion ingresada."
    };
  }

  if (parsed.data.status === "Resuelto" && !parsed.data.confirmed_by) {
    return {
      ok: false,
      message: "Indica quien aprueba la resolucion del ticket."
    };
  }

  const supabase = await createActionClient();

  const { error } = await supabase
    .from("incidents")
    .update({
      status: parsed.data.status,
      resolution_notes: parsed.data.resolution_notes,
      confirmed_by: parsed.data.confirmed_by,
      confirmed_at: new Date().toISOString()
    })
    .eq("code", parsed.data.code);

  if (error) {
    console.error(error);
    return {
      ok: false,
      message: "No fue posible confirmar la incidencia."
    };
  }

  revalidatePath(`/incidents/${parsed.data.code}/confirm`);
  revalidatePath("/incidents");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "La incidencia se actualizo correctamente.",
    status: parsed.data.status,
    resolution_notes: parsed.data.resolution_notes ?? null,
    confirmed_by: parsed.data.confirmed_by ?? null
  };
}

export type UpdateStatusResult = {
  ok: boolean;
  status?: IncidentStatus;
  message?: string;
};

const statusUpdateSchema = z.object({
  code: z.string().min(1),
  status: z.enum(INCIDENT_STATUSES)
});

export async function updateIncidentStatusAction(
  _: UpdateStatusResult,
  formData: FormData
): Promise<UpdateStatusResult> {
  const parsed = statusUpdateSchema.safeParse({
    code: formData.get("code"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "No se pudo cambiar el estado."
    };
  }

  const supabase = await createActionClient();
  const { error } = await supabase
    .from("incidents")
    .update({
      status: parsed.data.status
    })
    .eq("code", parsed.data.code);

  if (error) {
    console.error(error);
    return {
      ok: false,
      message: "No se pudo cambiar el estado."
    };
  }

  revalidatePath("/incidents");
  revalidatePath("/dashboard");

  return {
    ok: true,
    status: parsed.data.status,
    message: "Estado actualizado."
  };
}
