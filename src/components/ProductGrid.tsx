import { useEffect, useState } from "react";
import { getProducts, getCategories, type Product } from "@/lib/products";
import ProductCard from "./ProductCard";

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    setProducts(getProducts());
    setCategories(getCategories());
  }, []);

  const filtered = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

  return (
    <section id="products" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          สินค้าของเรา
        </h2>
        <p className="mt-2 text-muted-foreground">สดใหม่ อร่อย ราคาถูก</p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? "gradient-warm text-primary-foreground shadow-warm"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "gradient-warm text-primary-foreground shadow-warm"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          ยังไม่มีสินค้า{activeCategory ? `ในหมวด "${activeCategory}"` : ""}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
