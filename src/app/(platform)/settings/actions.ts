"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export type CreateUserState = {
  ok: boolean;
  message: string;
};

export type UpdateUserState = {
  ok: boolean;
  message: string;
};

export type DeleteUserState = {
  ok: boolean;
  message: string;
};

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Ingresa un correo." })
    .email({ message: "Correo invalido." })
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  role: z.enum(["Administrador", "Operador"]),
  status: z.enum(["Activo", "Inactivo"])
});

export async function createUserAction(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .filter(Boolean)[0];
    return {
      ok: false,
      message: firstError ?? "Datos invalidos."
    };
  }

  const supabase = createServiceRoleSupabaseClient();

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      role: parsed.data.role,
      status: parsed.data.status
    }
  });

  if (createError || !created.user) {
    return {
      ok: false,
      message: createError?.message ?? "No se pudo crear el usuario."
    };
  }

  const { error: upsertError } = await supabase
    .from("system_users")
    .upsert(
      {
        id: created.user.id,
        username: parsed.data.email,
        role: parsed.data.role,
        status: parsed.data.status
      },
      { onConflict: "id" }
    );

  if (upsertError) {
    return {
      ok: false,
      message: upsertError.message ?? "No se pudo registrar el usuario en el sistema."
    };
  }

  revalidatePath("/settings");

  return {
    ok: true,
    message: "Usuario creado correctamente."
  };
}

const updateRoleStatusSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["Administrador", "Operador"]),
  status: z.enum(["Activo", "Inactivo"])
});

export async function updateUserRoleStatusAction(
  _prevState: UpdateUserState,
  formData: FormData
): Promise<UpdateUserState> {
  const parsed = updateRoleStatusSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Datos invalidos para actualizar el usuario."
    };
  }

  const supabase = createServiceRoleSupabaseClient();

  const { error: updateMetadataError } = await supabase.auth.admin.updateUserById(parsed.data.userId, {
    user_metadata: {
      role: parsed.data.role,
      status: parsed.data.status
    }
  });

  if (updateMetadataError) {
    return {
      ok: false,
      message: updateMetadataError.message ?? "No se pudo actualizar los datos del usuario."
    };
  }

  const { error: updateTableError } = await supabase
    .from("system_users")
    .update({
      role: parsed.data.role,
      status: parsed.data.status
    })
    .eq("id", parsed.data.userId);

  if (updateTableError) {
    return {
      ok: false,
      message: updateTableError.message ?? "No se pudo actualizar la tabla interna."
    };
  }

  revalidatePath("/settings");

  return {
    ok: true,
    message: "Usuario actualizado correctamente."
  };
}

const deleteUserSchema = z.object({
  userId: z.string().uuid(),
  currentUserId: z.string().uuid()
});

export async function deleteUserAction(
  _prevState: DeleteUserState,
  formData: FormData
): Promise<DeleteUserState> {
  const parsed = deleteUserSchema.safeParse({
    userId: formData.get("userId"),
    currentUserId: formData.get("currentUserId")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Solicitud de eliminacion invalida."
    };
  }

  if (parsed.data.userId === parsed.data.currentUserId) {
    return {
      ok: false,
      message: "No puedes eliminar tu propia cuenta."
    };
  }

  const supabase = createServiceRoleSupabaseClient();

  const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(parsed.data.userId);

  if (deleteAuthError) {
    return {
      ok: false,
      message: deleteAuthError.message ?? "No se pudo eliminar al usuario."
    };
  }

  const { error: deleteTableError } = await supabase.from("system_users").delete().eq("id", parsed.data.userId);

  if (deleteTableError) {
    return {
      ok: false,
      message: deleteTableError.message ?? "No se pudo limpiar el registro interno."
    };
  }

  revalidatePath("/settings");

  return {
    ok: true,
    message: "Usuario eliminado correctamente."
  };
}
