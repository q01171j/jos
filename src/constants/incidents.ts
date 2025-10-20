export const INCIDENT_STATUSES = ["Pendiente", "En proceso", "Resuelto"] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
