import { NavLink } from "react-router-dom";
import type { MouseEvent } from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/event-record", label: "이벤트 기록" },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const handlePanelClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`absolute inset-0 z-50 transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={onClose}
        className={`absolute inset-0 bg-black/25 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-label="사이드바 닫기"
      />

      <aside
        onClick={handlePanelClick}
        className={`absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-neutral-200 bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-bold text-[#0D2B6B]">
              ElderSafe
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg px-3 py-2.5 text-[14px] font-medium transition ${
                      isActive
                        ? "bg-[#F3F7FF] text-[#2D68FF]"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* <div className="border-t border-neutral-200 p-4">
          <div className="mb-2 text-[12px] text-neutral-400">테스트 도구</div>
          <button
            type="button"
            className="w-full rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-100"
          >
            낙상 시뮬레이션
          </button>
        </div> */}
      </aside>
    </div>
  );
};

export default Sidebar;
