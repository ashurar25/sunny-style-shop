import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="glass rounded-[1.5rem] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 group"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center overflow-hidden relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Package className="w-12 h-12 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground/40">ยังไม่มีรูป</span>
          </div>
        )}
        {product.category && (
          <Badge className="absolute top-3 left-3 gradient-warm text-primary-foreground border-0 text-xs shadow-warm/50 rounded-lg px-3">
            {product.category}
          </Badge>
        )}
      </div>
      
      <div className="p-5 space-y-3">
        <h3 className="font-bold text-lg text-foreground leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        
        <div className="space-y-2 pt-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">ราคาปลีก</span>
            <span className="text-2xl font-extrabold text-primary">฿{product.retailPrice}</span>
          </div>
          <div className="flex items-center justify-between bg-secondary/30 rounded-xl px-4 py-2.5 border border-secondary/20">
            <span className="text-xs text-muted-foreground">
              ส่ง ขั้นต่ำ {product.minWholesaleQty} ชิ้น
            </span>
            <span className="text-lg font-bold text-accent-foreground">฿{product.wholesalePrice}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
