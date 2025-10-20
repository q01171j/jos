import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WeeklyPoint = {
  label: string;
  value: number;
};

type Props = {
  title: string;
  subtitle?: string;
  data: WeeklyPoint[];
};

export function WeeklyDistributionChart({ title, subtitle, data }: Props) {
  const maxValue = Math.max(1, ...data.map((point) => point.value));

  return (
    <Card className="rounded-3xl border-none bg-white shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex h-64 items-end justify-between gap-4">
          {data.map((point) => {
            const heightPercent = Math.max((point.value / maxValue) * 100, 6);
            return (
              <div
                key={point.label}
                className="flex h-full w-full flex-col items-center justify-end gap-2 text-xs font-medium text-muted-foreground"
              >
                <span className="text-xs font-semibold text-foreground">{point.value}</span>
                <div className="flex h-full w-full items-end justify-center rounded-3xl bg-secondary/15 p-4">
                  <div className="flex w-7 items-end">
                    <div
                      className="w-full rounded-full bg-primary transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                </div>
                <span>{point.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
