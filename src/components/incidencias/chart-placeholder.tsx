import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  subtitle?: string;
  type?: "bar" | "pie";
};

const dayLabels = ["Lun", "Mar", "Mie", "Jue", "Vie"];

export function ChartPlaceholder({ title, subtitle, type = "bar" }: Props) {
  return (
    <Card className="rounded-3xl border-none bg-white shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="pt-0">
        {type === "bar" ? (
          <div className="mt-4 flex h-64 items-end justify-between gap-4">
            {[65, 45, 72, 40, 85].map((value, index) => (
              <div
                key={index}
                className="flex w-full flex-col items-center gap-3 text-xs font-medium text-muted-foreground"
              >
                <div className="flex h-full w-full items-end justify-center rounded-3xl bg-secondary/15 p-4">
                  <div
                    className="w-6 rounded-full bg-secondary transition-all"
                    style={{ height: `${Math.max(value, 25)}%` }}
                  />
                </div>
                {dayLabels[index]}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="mx-auto h-52 w-52 rounded-full border-[18px] border-primary border-t-secondary border-r-destructive border-b-emerald-400" />
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                Resueltas
              </li>
              <li className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-secondary" />
                En proceso
              </li>
              <li className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-destructive" />
                Pendientes
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
