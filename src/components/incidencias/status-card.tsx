import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneClassname: Record<"Pendiente" | "En proceso" | "Resuelto", string> = {
  Pendiente: "border-l-8 border-destructive",
  "En proceso": "border-l-8 border-secondary",
  Resuelto: "border-l-8 border-emerald-500"
};

const iconFallback: Record<"Pendiente" | "En proceso" | "Resuelto", string> = {
  Pendiente: "P",
  "En proceso": "EP",
  Resuelto: "R"
};

type Props = {
  status: "Pendiente" | "En proceso" | "Resuelto";
  total: number;
  icon?: React.ReactNode;
};

export function StatusCard({ status, total, icon }: Props) {
  return (
    <Card className={cn("flex gap-4 rounded-3xl border-none bg-white p-6 shadow-[0_18px_42px_rgba(12,35,64,0.08)]", toneClassname[status])}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-sm font-semibold">
        {icon ?? iconFallback[status]}
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{status}</span>
        <span className="text-3xl font-semibold text-foreground">{total}</span>
      </CardContent>
    </Card>
  );
}
