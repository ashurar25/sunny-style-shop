import { useEffect, useState } from "react";
import { getProducts, type Product } from "@/lib/products";
import ProductCard from "./ProductCard";

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  return (
    <section id="products" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          สินค้าของเรา
        </h2>
        <p className="mt-2 text-muted-foreground">สดใหม่ อร่อย ราคาถูก</p>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          ยังไม่มีสินค้า
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
