"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { signInAction, type SignInState } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: SignInState = { error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="h-12 rounded-xl text-base font-semibold" disabled={pending}>
      {pending ? "Ingresando..." : "Ingresar"}
    </Button>
  );
}

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction] = useActionState<SignInState, FormData>(signInAction, initialState);

  useEffect(() => {
    if (state?.error) {
      console.warn(state.error);
    }
  }, [state?.error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-brand px-6 py-16">
      <Card className="w-full max-w-lg border-none bg-white/90 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary/15 bg-primary/10 text-3xl font-semibold text-primary">
            MH
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl text-primary">Municipalidad de Huancayo</CardTitle>
            <CardDescription className="text-base font-medium text-foreground/70">
              Sistema de Incidencias 360
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
            <div className="space-y-2">
              <Label htmlFor="email">Correo institucional</Label>
              <Input id="email" name="email" type="email" placeholder="usuario@huancayo.gob.pe" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Ingresa tu contrasena"
                autoComplete="current-password"
                required
              />
            </div>
            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-3 pt-2">
              <SubmitButton />
              <Button
                type="button"
                variant="secondary"
                className="h-11 rounded-xl text-sm font-medium"
                onClick={() =>
                  window.alert("Se envio un enlace de recuperacion a tu correo institucional.")
                }
              >
                Recuperar contrasena
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
