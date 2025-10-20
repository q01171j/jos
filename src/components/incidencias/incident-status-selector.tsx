"use client";

import { useEffect, useState, useTransition } from "react";
import { updateIncidentStatusAction, type UpdateStatusResult } from "@/app/(platform)/incidents/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { INCIDENT_STATUSES, type IncidentStatus } from "@/constants/incidents";

type Props = {
  code: string;
  initialStatus: IncidentStatus;
};

export function IncidentStatusSelector({ code, initialStatus }: Props) {
  const [currentStatus, setCurrentStatus] = useState<IncidentStatus>(initialStatus);
  const [optimisticStatus, setOptimisticStatus] = useState<IncidentStatus>(initialStatus);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCurrentStatus(initialStatus);
    setOptimisticStatus(initialStatus);
  }, [initialStatus]);

  const handleChange = (value: string) => {
    const nextStatus = value as IncidentStatus;
    if (nextStatus === currentStatus) {
      return;
    }

    setOptimisticStatus(nextStatus);
    const formData = new FormData();
    formData.set("code", code);
    formData.set("status", nextStatus);

    startTransition(() => {
      updateIncidentStatusAction({ ok: true, status: currentStatus }, formData).then((result) => {
        if (result.ok && result.status) {
          setCurrentStatus(result.status);
          setFeedback("Estado actualizado.");
          setTimeout(() => setFeedback(null), 3000);
        } else if (result.message) {
          setOptimisticStatus(currentStatus);
          setFeedback(result.message);
        }
      });
    });
  };

  const statusToBadgeVariant = (status: IncidentStatus) => {
    switch (status) {
      case "Resuelto":
        return "secondary" as const;
      case "En proceso":
        return "default" as const;
      default:
        return "destructive" as const;
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant={statusToBadgeVariant(optimisticStatus)} className="rounded-full px-3 py-1 text-xs">
          {optimisticStatus}
        </Badge>
        <Select value={optimisticStatus} onValueChange={handleChange} disabled={isPending}>
          <SelectTrigger className="h-8 w-40 rounded-xl border-border bg-background text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INCIDENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {feedback && <p className="text-xs text-muted-foreground">{feedback}</p>}
    </div>
  );
}
