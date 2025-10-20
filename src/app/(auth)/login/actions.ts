"use server";

import { redirect } from "next/navigation";
import { createActionClient } from "@/lib/supabase/actions";

export type SignInState = {
  error?: string;
};

const DEFAULT_REDIRECT = "/dashboard";

const isSafeRedirect = (path: string) => path.startsWith("/") && !path.startsWith("//");

export async function signInAction(
  _prevState: SignInState | void,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectToRaw = String(formData.get("redirectTo") ?? "").trim();
  const redirectTo = isSafeRedirect(redirectToRaw) ? redirectToRaw : DEFAULT_REDIRECT;

  if (!email || !password) {
    return { error: "Ingresa tu correo y contrasena." };
  }

  const supabase = await createActionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Credenciales invalidas. Verifica tus datos." };
  }

  redirect(redirectTo || DEFAULT_REDIRECT);
  return { error: "" };
}
