import React, { useEffect, useState } from "react";

import downloadIcon from "../assets/downloadIcon.svg";
import trashcanIcon from "../assets/trashcanIcon.svg";
import calendarIcon from "../assets/calendarIcon.svg";

import { getRecentEvents, type RecentEventItem } from "../apis/dashboardApi";

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

const EventRecordPage = () => {
  const [events, setEvents] = useState<RecentEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await getRecentEvents(50);
        setEvents(res.items);
      } catch (error) {
        console.error("이벤트 기록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-3">
      <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
        <h2 className="text-[16px] font-bold text-neutral-900">이벤트 발생 기록</h2>
        <p className="mt-1.5 text-[13px] leading-snug text-neutral-500">
          시스템에서 감지한 모든 이상 상황 내역입니다.
        </p>
        <div className="mt-4 flex flex-row gap-2">
          <button
            type="button"
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-[13px] font-medium text-neutral-800 transition hover:bg-neutral-50 active:bg-neutral-100"
          >
            <img src={downloadIcon} alt="" className="h-[18px] w-[18px] shrink-0" />
            엑셀 다운로드
          </button>
          <button
            type="button"
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-[13px] font-medium text-red-600 transition hover:bg-red-50 active:bg-red-100/80"
          >
            <img src={trashcanIcon} alt="" className="h-[18px] w-[18px] shrink-0" />
            기록 삭제
          </button>
        </div>
      </section>

      <section className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20">
            <p className="text-neutral-500 text-[14px]">기록 불러오는 중...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-14">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-sky-100">
              <img src={calendarIcon} alt="" className="h-10 w-10 object-contain opacity-90" />
            </div>
            <p className="mt-5 text-center text-[16px] font-bold text-slate-700">
              기록된 이벤트가 없습니다
            </p>
            <p className="mt-2 max-w-[260px] text-center text-[13px] leading-relaxed text-neutral-500">
              이벤트가 발생하면 이곳에 기록됩니다.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {events.map((event) => (
              <div key={event.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      event.status === "FALL"
                        ? "bg-red-50 text-red-600"
                        : "bg-neutral-50 text-neutral-600"
                    }`}
                  >
                    {event.status === "FALL" ? "낙상 감지" : "정상 감지"}
                  </span>
                  <span className="text-[12px] text-neutral-400">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[14px] text-neutral-800 font-medium">
                    {event.status === "FALL" ? "위험 상황 발생" : "상태 이상 없음"}
                  </p>
                  {event.confidence !== null && (
                    <span className="text-[12px] text-neutral-500">
                      신뢰도: {(event.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                {event.imageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-neutral-100">
                    <img 
                      src={`data:image/jpeg;base64,${event.imageUrl}`} 
                      alt="Captured event" 
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EventRecordPage;