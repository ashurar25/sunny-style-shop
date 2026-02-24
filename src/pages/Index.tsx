import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import ContactSection from "@/components/ContactSection";
import { Link } from "react-router-dom";
import { Settings, ShoppingCart } from "lucide-react";

const ADMIN_AUTH_KEY = "krungkring_admin_authed";

const Index = () => {
  const authed = localStorage.getItem(ADMIN_AUTH_KEY) === "1";

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      {/* Divider wave */}
      <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
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
          className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg text-white"
          title="สั่งซื้อ"
        >
          <ShoppingCart className="w-6 h-6" />
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
