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
      className="glass rounded-[var(--radius)] overflow-hidden shadow-card hover:shadow-warm transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Package className="w-16 h-16 text-muted-foreground/40" />
        )}
        {product.category && (
          <Badge className="absolute top-3 left-3 gradient-warm text-primary-foreground border-0 text-xs">
            {product.category}
          </Badge>
        )}
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        
        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ราคาปลีก</span>
            <span className="text-xl font-bold text-primary">฿{product.retailPrice}</span>
          </div>
          <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-1.5">
            <span className="text-xs text-secondary-foreground/70">
              ราคาส่ง (ขั้นต่ำ {product.minWholesaleQty} ชิ้น)
            </span>
            <span className="text-lg font-bold text-accent-foreground">฿{product.wholesalePrice}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
