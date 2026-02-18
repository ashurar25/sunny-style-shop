import { useState, useEffect, useRef } from "react";
import { getProducts, saveProducts, addProduct, deleteProduct, type Product } from "@/lib/products";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    retailPrice: "",
    wholesalePrice: "",
    minWholesaleQty: "",
    image: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!form.name || !form.retailPrice || !form.wholesalePrice || !form.minWholesaleQty) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    addProduct({
      name: form.name,
      description: form.description,
      image: form.image,
      retailPrice: Number(form.retailPrice),
      wholesalePrice: Number(form.wholesalePrice),
      minWholesaleQty: Number(form.minWholesaleQty),
    });
    setProducts(getProducts());
    setForm({ name: "", description: "", retailPrice: "", wholesalePrice: "", minWholesaleQty: "", image: "" });
    setShowForm(false);
    toast.success("เพิ่มสินค้าแล้ว");
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setProducts(getProducts());
    toast.success("ลบสินค้าแล้ว");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">จัดการสินค้า</h1>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gradient-warm text-primary-foreground rounded-full shadow-warm"
          >
            <Plus className="w-4 h-4 mr-1" /> เพิ่มสินค้า
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Add Form */}
        {showForm && (
          <div className="glass rounded-[var(--radius)] p-6 space-y-4 animate-fade-up">
            <h2 className="font-semibold text-lg text-foreground">เพิ่มสินค้าใหม่</h2>

            {/* Image upload */}
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-48 rounded-xl bg-muted flex flex-col items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors overflow-hidden"
            >
              {form.image ? (
                <img src={form.image} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImagePlus className="w-10 h-10 text-muted-foreground/50 mb-2" />
                  <span className="text-sm text-muted-foreground">คลิกเพื่ออัพโหลดรูปภาพ</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            <Input
              placeholder="ชื่อสินค้า"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <Textarea
              placeholder="รายละเอียด (ไม่จำเป็น)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                placeholder="ราคาปลีก"
                value={form.retailPrice}
                onChange={e => setForm(f => ({ ...f, retailPrice: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="ราคาส่ง"
                value={form.wholesalePrice}
                onChange={e => setForm(f => ({ ...f, wholesalePrice: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="ขั้นต่ำ (ชิ้น)"
                value={form.minWholesaleQty}
                onChange={e => setForm(f => ({ ...f, minWholesaleQty: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAdd} className="gradient-warm text-primary-foreground flex-1">
                บันทึก
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                ยกเลิก
              </Button>
            </div>
          </div>
        )}

        {/* Product list */}
        <div className="space-y-3">
          {products.map(product => (
            <div
              key={product.id}
              className="glass rounded-[var(--radius)] p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">
                    ไม่มีรูป
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ปลีก ฿{product.retailPrice} | ส่ง ฿{product.wholesalePrice} (ขั้นต่ำ {product.minWholesaleQty})
                </p>
              </div>
              <button
                onClick={() => handleDelete(product.id)}
                className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
