import React from "react";
import Header from "../components/Header";

import downloadIcon from "../assets/downloadIcon.svg";
import trashcanIcon from "../assets/trashcanIcon.svg";
import calendarIcon from "../assets/calendarIcon.svg";

const EventRecordPage = () => {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#F8F9FA]">
      <Header title="이벤트 기록" statusLabel="정상" statusTone="normal" />
      <main className="flex flex-1 flex-col gap-4 px-4 pb-8 pt-3">
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
          <h2 className="text-[16px] font-bold text-neutral-900">
            이벤트 발생 기록
          </h2>
          <p className="mt-1.5 text-[13px] leading-snug text-neutral-500">
            시스템에서 감지한 모든 이상 상황 내역입니다.
          </p>
          <div className="mt-4 flex flex-row gap-2">
            <button
              type="button"
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-[13px] font-medium text-neutral-800 transition hover:bg-neutral-50 active:bg-neutral-100"
            >
              <img
                src={downloadIcon}
                alt=""
                className="h-[18px] w-[18px] shrink-0"
              />
              엑셀 다운로드
            </button>
            <button
              type="button"
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-[13px] font-medium text-red-600 transition hover:bg-red-50 active:bg-red-100/80"
            >
              <img
                src={trashcanIcon}
                alt=""
                className="h-[18px] w-[18px] shrink-0"
              />
              기록 삭제
            </button>
          </div>
        </section>
        <section className="flex min-h-[min(420px,55dvh)] flex-1 flex-col rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-14">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-sky-100">
              <img
                src={calendarIcon}
                alt=""
                className="h-10 w-10 object-contain opacity-90"
              />
            </div>
            <p className="mt-5 text-center text-[16px] font-bold text-slate-700">
              기록된 이벤트가 없습니다
            </p>
            <p className="mt-2 max-w-[260px] text-center text-[13px] leading-relaxed text-neutral-500">
              이벤트가 발생하면 이곳에 기록됩니다.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EventRecordPage;
