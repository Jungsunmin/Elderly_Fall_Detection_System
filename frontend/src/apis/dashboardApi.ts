import { call } from "./auth/ApiService";

export type HeaderStatus = "normal" | "danger";

export type DashboardStatusResponse = {
  status: HeaderStatus;
  dangerUntil: string | null;
  lastFallAt: string | null;
  serverNow: string;
};

export type RecentEventItem = {
  id: number;
  status: "FALL" | "STILL";
  confidence: number | null;
  imageUrl: string | null;
  timestamp: string;
};

export type RecentEventsResponse = {
  items: RecentEventItem[];
};

export async function getDashboardStatus(): Promise<DashboardStatusResponse> {
  return (await call(
    "/api/dashboard/status",
    "GET",
  )) as DashboardStatusResponse;
}

export async function getRecentEvents(
  limit = 10,
): Promise<RecentEventsResponse> {
  return (await call(
    `/api/events/recent?limit=${limit}`,
    "GET",
  )) as RecentEventsResponse;
}

export async function getCameraStatus(): Promise<{ status: string }> {
  return (await call("/api/status/camera", "GET")) as { status: string };
}
