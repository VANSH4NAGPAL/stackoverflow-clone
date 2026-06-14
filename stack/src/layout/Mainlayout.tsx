import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import Sidebar from "@/components/Sidebar";
import React, { ReactNode, useEffect, useState } from "react";

interface MainlayoutProps {
  children: ReactNode;
}

const Mainlayout = ({ children }: MainlayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleslidein = () => {
    setSidebarOpen((state) => !state);
  };

  return (
    <div className="bg-[#f8f9fa] text-[#3a3a3a] min-h-screen flex flex-col relative">
      <Navbar handleslidein={handleslidein} />
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        <Sidebar isopen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6 bg-white overflow-x-hidden min-h-[calc(100vh-53px)]">
          {children}
        </main>
        <div className="hidden lg:block border-l border-gray-200">
          <RightSideBar />
        </div>
      </div>
    </div>
  );
};

export default Mainlayout;
