import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="w-12 h-12 rounded-2xl bg-muted/80 backdrop-blur border border-border text-foreground shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
      title="กลับด้านบน"
      aria-label="กลับด้านบน"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default BackToTop;
