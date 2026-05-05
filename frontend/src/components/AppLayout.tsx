import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

import { useLocation } from "react-router-dom";

type statusType = "normal" | "danger";
const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  //statusTone은
  const location = useLocation();
  const currentPath = location.pathname;
  const [status, setStatus] = useState<statusType>("normal");
  
  //status는 backend에서 받아올 예정. 
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  let title = "";

  if (currentPath.includes("/dashboard")) {
    title = "대시보드";
  } else if (currentPath.includes("/event-record")) {
    title = "이벤트 기록";
  }

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F8F9FA overflow-hidden">
      <Header title={title} status={status} toggleSidebar={toggleSidebar} />

      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar}/>

      <Outlet />
    </div>
  );
};

export default AppLayout;
