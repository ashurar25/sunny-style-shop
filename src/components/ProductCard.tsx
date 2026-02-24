import React from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { Flame, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index: number;
  enableAddToCart?: boolean;
  highPriorityImage?: boolean;
}

const ProductCard = React.memo(function ProductCard({ product, index, enableAddToCart = false, highPriorityImage = false }: ProductCardProps) {
  const handleAddToCart = () => {
    try {
      const key = "sunny_cart_v2";
      const raw = localStorage.getItem(key);
      const cart: Array<{ id: string; quantity: number }> = raw ? JSON.parse(raw) : [];
      const existing = cart.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id: product.id, quantity: 1 });
      }
      localStorage.setItem(key, JSON.stringify(cart));
      toast.success("เพิ่มลงตะกร้าแล้ว");
    } catch (e) {
      console.error(e);
      toast.error("เพิ่มลงตะกร้าไม่สำเร็จ");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="glass rounded-2xl overflow-hidden shadow-card group"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center overflow-hidden relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading={highPriorityImage ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Package className="w-12 h-12 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground/40">ยังไม่มีรูป</span>
          </div>
        )}
        {product.category && (
          <Badge className="absolute top-2 left-2 gradient-warm text-primary-foreground border-0 text-[11px] shadow-warm/50 rounded-md px-2 py-0.5">
            {product.category}
          </Badge>
        )}

        {product.pinned && (
          <Badge className="absolute top-2 right-2 bg-orange-500 text-white border-0 text-[11px] shadow-warm/50 rounded-md px-2 py-0.5">
            <Flame className="w-3 h-3 mr-1" /> ขายดี
          </Badge>
        )}
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">ราคาปลีก</span>
            <span className="text-xl font-extrabold text-primary">฿{product.retailPrice}</span>
          </div>
          <div className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-secondary/20">
            <span className="text-[11px] text-muted-foreground">
              ส่ง ขั้นต่ำ {product.minWholesaleQty} ชิ้น
            </span>
            <span className="text-base font-bold text-accent-foreground">฿{product.wholesalePrice}</span>
          </div>
        </div>

        {enableAddToCart && (
          <Button onClick={handleAddToCart} className="w-full gradient-warm text-primary-foreground h-9 text-sm">
            เพิ่มลงตะกร้า
          </Button>
        )}
      </div>
    </motion.div>
  );
});

export default ProductCard;
