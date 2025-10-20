import type { ReactNode } from "react";
import { SidebarNav } from "@/components/incidencias/sidebar-nav";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-[280px_1fr] bg-background">
        <SidebarNav userEmail={user?.email ?? undefined} />
        <main className="flex flex-col gap-8 px-10 py-10">{children}</main>
      </div>
    </div>
  );
}
