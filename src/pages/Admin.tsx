import { useState, useEffect, useRef, lazy, Suspense, type ChangeEvent } from "react";
import { DataService, type Product } from "@/lib/data-service";
import { compressImageToBlob, uploadProductImageBlob } from "@/lib/storage";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ImagePlus, Tag, X, Pin, PinOff, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/hooks/useAdmin";

const AdminOrders = lazy(() => import("@/components/AdminOrders"));
const AdminDashboard = lazy(() => import("@/components/AdminDashboard"));

const getErrorMessage = (e: unknown) => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch { return "Unknown error"; }
};

const Admin = () => {
  const { isAdmin, loading: adminLoading, user } = useAdmin();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", retailPrice: "", wholesalePrice: "",
    minWholesaleQty: "", weightKg: "", image: "", category: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        const [p, c] = await Promise.all([DataService.getProducts(), DataService.getCategories()]);
        setProducts(p);
        setCategories(c);
      } catch (e) { console.error(e); }
    };
    load();
  }, [isAdmin]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("กำลังอัพโหลดรูปภาพ...", { id: "upload" });
      const blob = await compressImageToBlob(file);
      const url = await uploadProductImageBlob(blob);
      setForm(f => ({ ...f, image: url }));
      toast.success("อัพโหลดรูปภาพเรียบร้อย", { id: "upload" });
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error(`อัพโหลดรูปไม่สำเร็จ: ${getErrorMessage(err)}`, { id: "upload" });
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.retailPrice || !form.wholesalePrice || !form.minWholesaleQty) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    try {
      const productData = {
        name: form.name,
        description: form.description,
        image: form.image,
        retailPrice: Number(form.retailPrice),
        wholesalePrice: Number(form.wholesalePrice),
        minWholesaleQty: Number(form.minWholesaleQty),
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        category: form.category || undefined,
      };
      if (editingId) {
        await DataService.updateProduct(editingId, productData);
        toast.success("แก้ไขสินค้าแล้ว");
      } else {
        await DataService.addProduct(productData);
        toast.success("เพิ่มสินค้าแล้ว");
      }
      const [p, c] = await Promise.all([DataService.getProducts(), DataService.getCategories()]);
      setProducts(p); setCategories(c);
      setEditingId(null);
      setForm({ name: "", description: "", retailPrice: "", wholesalePrice: "", minWholesaleQty: "", weightKg: "", image: "", category: "" });
      setShowForm(false);
    } catch (e) {
      console.error(e);
      toast.error(`บันทึกไม่สำเร็จ: ${getErrorMessage(e)}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await DataService.deleteProduct(id);
      setProducts(await DataService.getProducts());
      toast.success("ลบสินค้าแล้ว");
    } catch (e) { console.error(e); toast.error("ลบไม่สำเร็จ"); }
  };

  const handleTogglePin = async (product: Product) => {
    const isPinned = !!product.pinned;
    if (!isPinned && products.filter(p => !!p.pinned).length >= 5) {
      toast.error("ปักหมุดได้สูงสุด 5 รายการ");
      return;
    }
    try {
      await DataService.updateProduct(product.id, {
        pinned: !isPinned,
        pinnedAt: !isPinned ? Date.now() : (null as any),
      });
      setProducts(await DataService.getProducts());
      toast.success(!isPinned ? "ปักหมุดแล้ว" : "ถอนหมุดแล้ว");
    } catch (e) { console.error(e); toast.error("ทำรายการไม่สำเร็จ"); }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const updated = await DataService.addCategory(newCategory.trim());
      setCategories(updated); setNewCategory("");
      toast.success("เพิ่มหมวดหมู่แล้ว");
    } catch (e) { console.error(e); toast.error("เพิ่มหมวดหมู่ไม่สำเร็จ"); }
  };

  const handleDeleteCategory = async (name: string) => {
    try {
      const updated = await DataService.deleteCategory(name);
      setCategories(updated);
      toast.success("ลบหมวดหมู่แล้ว");
    } catch (e) { console.error(e); toast.error("ลบหมวดหมู่ไม่สำเร็จ"); }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      retailPrice: String(product.retailPrice),
      wholesalePrice: String(product.wholesalePrice),
      minWholesaleQty: String(product.minWholesaleQty),
      weightKg: product.weightKg !== undefined && product.weightKg !== null ? String(product.weightKg) : "",
      image: product.image || "",
      category: product.category || "",
    });
    setShowForm(true);
  };

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in → go to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Not admin → show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-muted-foreground">บัญชีนี้ไม่ได้เป็นแอดมิน</p>
          <Link to="/">
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-1" /> กลับหน้าแรก
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">แอดมิน</h1>
          </div>
          {activeTab === "products" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCategoryForm(!showCategoryForm)} className="rounded-full">
                <Tag className="w-4 h-4 mr-1" /> หมวดหมู่
              </Button>
              <Button onClick={() => setShowForm(!showForm)} className="gradient-warm text-primary-foreground rounded-full shadow-warm">
                <Plus className="w-4 h-4 mr-1" /> เพิ่มสินค้า
              </Button>
            </div>
          )}
        </div>
        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 pb-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "dashboard" ? "gradient-warm text-primary-foreground shadow-warm" : "text-muted-foreground hover:bg-muted"}`}
          >
            แดชบอร์ด
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "products" ? "gradient-warm text-primary-foreground shadow-warm" : "text-muted-foreground hover:bg-muted"}`}
          >
            สินค้า
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === "orders" ? "gradient-warm text-primary-foreground shadow-warm" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Package className="w-4 h-4" /> ออเดอร์
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {activeTab === "dashboard" ? (
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
            <AdminDashboard />
          </Suspense>
        ) : activeTab === "orders" ? (
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
            <AdminOrders />
          </Suspense>
        ) : (
          <>
            {/* Category Management */}
            {showCategoryForm && (
              <div className="glass rounded-[var(--radius)] p-6 space-y-4 animate-fade-up">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" /> จัดการหมวดหมู่
                </h2>
                <div className="flex gap-2">
                  <Input placeholder="ชื่อหมวดหมู่ใหม่" value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddCategory()} />
                  <Button onClick={handleAddCategory} className="gradient-warm text-primary-foreground shrink-0"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Badge key={cat} variant="secondary" className="text-sm py-1.5 px-3 flex items-center gap-1.5">
                      {cat}
                      <button onClick={() => handleDeleteCategory(cat)} className="ml-1 hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
              <div className="glass rounded-[var(--radius)] p-6 space-y-4 animate-fade-up">
                <h2 className="font-semibold text-lg text-foreground">{editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
                <div onClick={() => fileRef.current?.click()} className="w-full h-48 rounded-xl bg-muted flex flex-col items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors overflow-hidden">
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
                <Input placeholder="ชื่อสินค้า" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <Textarea placeholder="รายละเอียด (ไม่จำเป็น)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">หมวดหมู่</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button key={cat} type="button" onClick={() => setForm(f => ({ ...f, category: f.category === cat ? "" : cat }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${form.category === cat ? "gradient-warm text-primary-foreground shadow-warm" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input type="number" inputMode="decimal" step="any" placeholder="ราคาปลีก" value={form.retailPrice ?? ""} onChange={e => setForm(f => ({ ...f, retailPrice: e.target.value }))} />
                  <Input type="number" inputMode="decimal" step="any" placeholder="ราคาส่ง" value={form.wholesalePrice ?? ""} onChange={e => setForm(f => ({ ...f, wholesalePrice: e.target.value }))} />
                  <Input type="number" inputMode="numeric" step="1" placeholder="ขั้นต่ำ (ชิ้น)" value={form.minWholesaleQty ?? ""} onChange={e => setForm(f => ({ ...f, minWholesaleQty: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input type="number" inputMode="decimal" step="any" placeholder="น้ำหนัก (กก.)" value={form.weightKg ?? ""} onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))} />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} className="gradient-warm text-primary-foreground flex-1">บันทึก</Button>
                  <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: "", description: "", retailPrice: "", wholesalePrice: "", minWholesaleQty: "", weightKg: "", image: "", category: "" }); }} className="flex-1">ยกเลิก</Button>
                </div>
              </div>
            )}

            {/* Product list */}
            <div className="space-y-3">
              {products.slice().sort((a, b) => {
                const ap = a.pinned ? 1 : 0; const bp = b.pinned ? 1 : 0;
                if (ap !== bp) return bp - ap;
                const at = a.pinnedAt ?? 0; const bt = b.pinnedAt ?? 0;
                if (at !== bt) return bt - at;
                return Number(b.id) - Number(a.id);
              }).map(product => (
                <div key={product.id} className="glass rounded-[var(--radius)] p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">ไม่มีรูป</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                      {product.pinned && <Badge className="text-xs shrink-0 gradient-warm text-primary-foreground border-0" variant="secondary">ขายดี</Badge>}
                      {product.category && <Badge variant="secondary" className="text-xs shrink-0">{product.category}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">ปลีก ฿{product.retailPrice} | ส่ง ฿{product.wholesalePrice} (ขั้นต่ำ {product.minWholesaleQty})</p>
                  </div>
                  <Button variant="outline" onClick={() => handleTogglePin(product)} className="rounded-xl shrink-0" title={product.pinned ? "ถอนหมุด" : "ปักหมุด"}>
                    {product.pinned ? (<><PinOff className="w-4 h-4 mr-1" /> ถอนหมุด</>) : (<><Pin className="w-4 h-4 mr-1" /> ปักหมุด</>)}
                  </Button>
                  <Button variant="outline" onClick={() => startEdit(product)} className="rounded-xl shrink-0">แก้ไข</Button>
                  <button onClick={() => handleDelete(product.id)} className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
