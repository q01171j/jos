import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusPoint = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  title: string;
  subtitle?: string;
  data: StatusPoint[];
};

export function StatusDonutChart({ title, subtitle, data }: Props) {
  const total = data.reduce((sum, point) => sum + point.value, 0);

  return (
    <Card className="rounded-3xl border-none bg-white shadow-[0_18px_42px_rgba(12,35,64,0.08)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mt-4 grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="relative mx-auto h-52 w-52">
            <div
              className="h-full w-full rounded-full"
              style={{
                background: total === 0 ? "#e2e8f0" : `conic-gradient(${buildSegments(data, total)})`
              }}
            />
            <div className="absolute inset-8 rounded-full bg-white" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground">
                Total {total}
              </span>
            </div>
          </div>
          <ul className="space-y-3 text-sm">
            {data.map((point) => (
              <li key={point.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: point.color }}
                    aria-hidden="true"
                  />
                  <span>{point.label}</span>
                </div>
                <span className="font-semibold text-foreground">{point.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function buildSegments(data: StatusPoint[], total: number) {
  let cursor = 0;
  return data
    .map((point) => {
      const start = (cursor / total) * 360;
      cursor += point.value;
      const end = total === cursor ? 360 : (cursor / total) * 360;
      return `${point.color} ${start}deg ${end}deg`;
    })
    .join(", ");
}
