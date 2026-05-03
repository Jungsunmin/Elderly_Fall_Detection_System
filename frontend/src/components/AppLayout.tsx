import { useState, type ReactNode } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

type AppLayoutProps = {
  title: string;
  statusLabel?: string;
  statusTone?: "normal" | "danger";
  children: ReactNode;
};

const AppLayout = ({
  title,
  statusLabel = "정상",
  statusTone = "normal",
  children,
}: AppLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F8F9FA]">
      <Header
        title={title}
        statusLabel={statusLabel}
        statusTone={statusTone}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex flex-1 flex-col gap-4 px-4 pb-8 pt-3">{children}</main>
    </div>
  );
};

export default AppLayout;