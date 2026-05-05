import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { getDashboardStatus, type HeaderStatus } from "../apis/dashboardApi";

import { useLocation } from "react-router-dom";

type LayoutContext = {
  headerStatus: HeaderStatus;
  dangerUntil: string | null;
  refreshStatus: () => Promise<void>;
};

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [headerStatus, setHeaderStatus] = useState<HeaderStatus>("normal");
  const [dangerUntil, setDangerUntil] = useState<string | null>(null);

  const location = useLocation();
  const currentPath = location.pathname;

  //status는 backend에서 받아올 예정.
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const refreshStatus = async () => {
    try {
      const statusRes = await getDashboardStatus();
      setHeaderStatus(statusRes.status);
      setDangerUntil(statusRes.dangerUntil);
    } catch (error) {
      console.error("status 조회 실패:", error);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!dangerUntil) return;
      if (new Date() >= new Date(dangerUntil)) {
        setHeaderStatus("normal");
        setDangerUntil(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [dangerUntil]);

  let title = "";

  if (currentPath.includes("/dashboard")) {
    title = "대시보드";
  } else if (currentPath.includes("/event-record")) {
    title = "이벤트 기록";
  }

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F8F9FA overflow-hidden">
      <Header title={title} status={headerStatus} toggleSidebar={toggleSidebar} />

      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <Outlet context={{ headerStatus, dangerUntil, refreshStatus } satisfies LayoutContext} />
    </div>
  );
};

export default AppLayout;
export type { LayoutContext };