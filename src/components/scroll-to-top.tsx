"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return visible ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-50 bg-[#CAFF00] text-[#0A1628] w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(202,255,0,0.4)] hover:shadow-[0_0_35px_rgba(202,255,0,0.6)] hover:scale-110 transition-all duration-300 cursor-pointer"
    >
      <ChevronUp size={20} strokeWidth={3} />
    </button>
  ) : null;
}
