import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { getDashboardStatus, getCameraStatus, type HeaderStatus } from "../apis/dashboardApi";

import { useLocation } from "react-router-dom";

type LayoutContext = {
  headerStatus: HeaderStatus;
  cameraConnected: boolean;
  dangerUntil: string | null;
  refreshStatus: () => Promise<void>;
};

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [headerStatus, setHeaderStatus] = useState<HeaderStatus>("normal");
  const [cameraConnected, setCameraConnected] = useState(false);
  const [dangerUntil, setDangerUntil] = useState<string | null>(null);

  const location = useLocation();
  const currentPath = location.pathname;

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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

  const refreshCameraStatus = async () => {
    try {
      const statusRes = await getCameraStatus();
      setCameraConnected(statusRes.status === "ONLINE");
    } catch (error) {
      console.error("camera status 조회 실패:", error);
    }
  };

  useEffect(() => {
    void refreshStatus();
    void refreshCameraStatus();

    const backendUrl = `http://${window.location.hostname}:4000`;
    const socket = io(backendUrl, {
      transports: ["websocket"],
    });

    socket.on("FALL_DETECTED", () => {
      void refreshStatus();
    });

    socket.on("CAMERA_STATUS_CHANGED", (data: { status: string }) => {
      setCameraConnected(data.status === "ONLINE");
    });

    return () => {
      socket.disconnect();
    };
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
    <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-[#F8F9FA]">
      <Header title={title} status={headerStatus} toggleSidebar={toggleSidebar} />

      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <Outlet context={{ headerStatus, cameraConnected, dangerUntil, refreshStatus } satisfies LayoutContext} />
    </div>
  );
};

export default AppLayout;
export type { LayoutContext };