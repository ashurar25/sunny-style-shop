import { useEffect, useState } from "react";
import { DataService, type Product } from "@/lib/data-service";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          DataService.getProductsFromDBOnly(),
          DataService.getCategoriesFromDBOnly()
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
  useEffect(() => {
    setVisibleCount(20);
  }, [activeCategory, query]);

  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const sorted = products
    .slice()
    .sort((a, b) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap;
      const at = a.pinnedAt ?? 0;
      const bt = b.pinnedAt ?? 0;
      if (at !== bt) return bt - at;
      return Number(b.id) - Number(a.id);
    });

  const filtered = sorted.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (!normalizedQuery) return true;
    return (p.name || "").toLowerCase().includes(normalizedQuery);
  });

  const visibleProducts = filtered.slice(0, visibleCount);

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

      {/* Search */}
      <div className="max-w-xl mx-auto mb-6">
        <Input
          placeholder="ค้นหาสินค้า..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <p className="text-center text-muted-foreground text-sm">
            กำลังโหลดข้อมูลสินค้า...
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 text-lg">
          {normalizedQuery
            ? `ไม่พบสินค้า${activeCategory ? ` ในหมวด "${activeCategory}"` : ""} ที่ตรงกับ "${query.trim()}"`
            : `ยังไม่มีสินค้า${activeCategory ? ` ในหมวด "${activeCategory}"` : ""}`}
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {visibleProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                enableAddToCart
                highPriorityImage={i < 5}
              />
            ))}
          </div>
          {filtered.length > visibleCount && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((c) => c + 20)}
                className="rounded-full"
              >
                ดูเพิ่ม
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
