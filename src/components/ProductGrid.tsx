import { useEffect, useState } from "react";
import { DataService, type Product } from "@/lib/data-service";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { motion } from "framer-motion";

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          DataService.getProducts(),
          DataService.getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filtered = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

  return (
    <section id="products" className="py-10 px-4 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6"
      >
        <span className="text-sm font-semibold text-primary tracking-widest uppercase">เมนูแนะนำ</span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mt-2">
          สินค้าของเรา
        </h2>
        <p className="mt-2 text-muted-foreground text-base">สดใหม่ อร่อย ราคาถูก</p>
      </motion.div>

      {/* Category filter pills */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-6"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeCategory === null
                ? "gradient-warm text-primary-foreground shadow-warm"
                : "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 hover:shadow-sm"
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? "gradient-warm text-primary-foreground shadow-warm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 text-lg">
          ยังไม่มีสินค้า{activeCategory ? ` ในหมวด "${activeCategory}"` : ""}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} enableAddToCart />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
