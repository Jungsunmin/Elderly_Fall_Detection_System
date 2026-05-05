import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { io } from "socket.io-client";

import CameraIcon from "../assets/cameraIcon.svg";
import LiveIcon from "../assets/liveIcon.svg";
import CheckIconGreen from "../assets/checkIcon_green.svg";
import CheckIcon from "../assets/checkIcon.svg";
import SystemIcon from "../assets/systemIcon.svg";
import ClockIcon from "../assets/clockIcon.svg";

import { getRecentEvents, type RecentEventItem } from "../apis/dashboardApi";
import type { LayoutContext } from "../components/AppLayout";

type StatusRowProps = {
  label: string;
  badge: string;
  badgeVariant: "success" | "neutral" | "danger";
};

const StatusRow = ({ label, badge, badgeVariant }: StatusRowProps) => (
  <div className="flex items-center justify-between gap-3 border-b border-neutral-100 py-3 last:border-b-0 last:pb-0 first:pt-0">
    <span className="text-[14px] text-neutral-700">{label}</span>
    <span
      className={
        badgeVariant === "success"
          ? "rounded-full bg-[#E8F5E9] px-2.5 py-1 text-[12px] font-medium text-[#1e7e34]"
          : badgeVariant === "danger"
            ? "rounded-full bg-red-100 px-2.5 py-1 text-[12px] font-medium text-red-700"
            : "rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-medium text-neutral-600"
      }
    >
      {badge}
    </span>
  </div>
);

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const DashboardPage = () => {
  const { headerStatus, refreshStatus } = useOutletContext<LayoutContext>();
  const [recentEvents, setRecentEvents] = useState<RecentEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isDanger = useMemo(() => headerStatus === "danger", [headerStatus]);
  const latestEvent = recentEvents[0] ?? null;

  useEffect(() => {
    let mounted = true;

    const loadRecent = async () => {
      try {
        const recentRes = await getRecentEvents(10);
        if (!mounted) return;
        setRecentEvents(recentRes.items);
      } catch (error) {
        console.error("최근 이벤트 로딩 실패:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadRecent();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    socket.on("FALL_DETECTED", (event: RecentEventItem) => {
      setRecentEvents((prev) => [event, ...prev].slice(0, 10));
      void refreshStatus();
    });

    return () => {
      socket.disconnect();
    };
  }, [refreshStatus]);

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-3">
      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={CameraIcon} alt="Camera" />
            <span className="text-[15px] font-semibold text-neutral-900">
              카메라 1
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5">
            <img src={LiveIcon} alt="Live" />
            <span className="text-[11px] font-bold tracking-wide text-red-600">
              LIVE
            </span>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full bg-neutral-200">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.35) 100%), url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80)",
            }}
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <div className="rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm">
              {latestEvent ? formatDateTime(latestEvent.timestamp) : "-"}
            </div>
            <div
              className={`flex items-center gap-1 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-medium backdrop-blur-sm ${
                isDanger ? "text-red-300" : "text-[#90EE90]"
              }`}
            >
              <img src={CheckIconGreen} alt="CheckGreen" />
              {isDanger ? "위험 상태" : "안전 상태"}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <img src={SystemIcon} alt="System" />
          <h2 className="text-[15px] font-semibold text-neutral-900">
            시스템 상태
          </h2>
        </div>
        <div className="mt-2">
          <StatusRow
            label="AI 분석 엔진"
            badge="정상 가동중"
            badgeVariant="success"
          />
          <StatusRow
            label="센서 연결"
            badge="1/1 연결됨"
            badgeVariant="success"
          />
          <StatusRow
            label="현재 감지 상태"
            badge={isDanger ? "위험 감지됨" : "정상"}
            badgeVariant={isDanger ? "danger" : "neutral"}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <img src={ClockIcon} alt="Clock" />
          <h2 className="text-[15px] font-semibold text-neutral-900">
            최근 이벤트
          </h2>
        </div>

        {loading ? (
          <p className="py-8 text-center text-[14px] text-neutral-500">
            불러오는 중...
          </p>
        ) : recentEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <img src={CheckIcon} alt="Check" />
            </div>
            <p className="mt-4 text-center text-[14px] text-neutral-500">
              기록된 특이사항이 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-neutral-200 p-3 text-[13px] text-neutral-700"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold ${
                      event.status === "FALL"
                        ? "text-red-600"
                        : "text-neutral-700"
                    }`}
                  >
                    {event.status === "FALL" ? "낙상 감지" : "정상 감지"}
                  </span>
                  <span className="text-neutral-500">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>
                {event.confidence !== null && (
                  <p className="mt-1 text-neutral-500">
                    신뢰도: {(event.confidence * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
