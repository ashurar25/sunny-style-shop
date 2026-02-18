import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import ContactSection from "@/components/ContactSection";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <ProductGrid />
      <ContactSection />

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>© 2025 กรุ้งกริ้ง ทอดกรอบ — อาหารสด แปรรูป</p>
      </footer>

      {/* Admin FAB */}
      <Link
        to="/admin"
        className="fixed bottom-6 right-6 w-14 h-14 gradient-warm rounded-full flex items-center justify-center shadow-warm hover:scale-110 transition-transform z-50"
        title="แอดมิน"
      >
        <Settings className="w-6 h-6 text-primary-foreground" />
      </Link>
    </div>
  );
};

export default Index;
