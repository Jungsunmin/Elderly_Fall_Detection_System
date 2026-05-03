import React from "react";

import Header from "../components/Header";

import CameraIcon from "../assets/cameraIcon.svg";
import LiveIcon from "../assets/liveIcon.svg";
import CheckIconGreen from "../assets/checkIconGreen.svg";
import CheckIcon from "../assets/checkIcon.svg";
import SystemIcon from "../assets/systemIcon.svg";
import ClockIcon from "../assets/clockIcon.svg";

type StatusRowProps = {
  label: string;
  badge: string;
  badgeVariant: "success" | "neutral";
};

const StatusRow = ({ label, badge, badgeVariant }: StatusRowProps) => (
  <div className="flex items-center justify-between gap-3 border-b border-neutral-100 py-3 last:border-b-0 last:pb-0 first:pt-0">
    <span className="text-[14px] text-neutral-700">{label}</span>
    <span
      className={
        badgeVariant === "success"
          ? "rounded-full bg-[#E8F5E9] px-2.5 py-1 text-[12px] font-medium text-[#1e7e34]"
          : "rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-medium text-neutral-600"
      }
    >
      {badge}
    </span>
  </div>
);

const DashboardPage = () => {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#F8F9FA]">
      <Header title="대시보드" />

      <main className="flex flex-1 flex-col gap-4 px-4 pb-8 pt-3">
        <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <CameraIcon />
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
                2024-05-03 22:10:22
              </div>
              <div className="flex items-center gap-1 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-medium text-[#90EE90] backdrop-blur-sm">
                <img src={CheckIconGreen} alt="CheckGreen" />
                안전 상태
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
              label="최근 무동작 시간"
              badge="0분"
              badgeVariant="neutral"
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
          <div className="flex flex-col items-center justify-center py-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <img src={CheckIcon} alt="Check" />
            </div>
            <p className="mt-4 text-center text-[14px] text-neutral-500">
              기록된 특이사항이 없습니다.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
