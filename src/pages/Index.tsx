import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import ContactSection from "@/components/ContactSection";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Settings, ShoppingCart } from "lucide-react";

const ADMIN_AUTH_KEY = "krungkring_admin_authed";
const CART_STORAGE_KEY_V2 = "sunny_cart_v2";

const Index = () => {
  const authed = localStorage.getItem(ADMIN_AUTH_KEY) === "1";
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const readCount = () => {
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY_V2);
        if (!raw) return setCartCount(0);
        const parsed = JSON.parse(raw);
        const items = Array.isArray(parsed) ? parsed : [];
        const count = items.reduce((sum: number, it: any) => sum + Number(it?.quantity ?? 0), 0);
        setCartCount(Number.isFinite(count) ? count : 0);
      } catch {
        setCartCount(0);
      }
    };

    readCount();
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY_V2) readCount();
    };
    const onSameTabCart = () => readCount();
    const onVisible = () => {
      if (document.visibilityState === "visible") readCount();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("sunny-cart-updated", onSameTabCart as any);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sunny-cart-updated", onSameTabCart as any);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      {/* Divider wave */}
      <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      {/* Quick order hint banner */}
      <div className="text-center py-3 px-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-b border-emerald-500/20">
        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
          วิธีสั่งง่ายที่สุด คือแค่ปรูปสินค้าแล้วสั่งกับแอดมินทาง Line หรือเพจได้เลย
        </p>
      </div>
      
      <ProductGrid />
      <ContactSection />

      {/* Footer */}
      <footer className="py-10 text-center border-t border-border bg-card/50">
        <p className="text-sm text-muted-foreground">
          © 2025 กรุ๊งกริ๊ง ทอดกรอบ — อาหารสด แปรรูป
        </p>
      </footer>

      {/* FABs */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Link
          to="/order"
          className="relative w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg text-white"
          title="สั่งซื้อ"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center shadow">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>
        {authed && (
          <Link
            to="/admin"
            className="w-14 h-14 gradient-warm rounded-2xl flex items-center justify-center shadow-warm"
            title="แอดมิน"
          >
            <Settings className="w-6 h-6 text-primary-foreground" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Index;
