import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { compressImage } from "@/lib/image-compress";
import { DataService, type Product } from "@/lib/data-service";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ImagePlus, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ADMIN_AUTH_KEY = "krungkring_admin_authed";
const ADMIN_ID = "kenginol";
const ADMIN_PASS = "930425";

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [login, setLogin] = useState({ id: "", pass: "" });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    retailPrice: "",
    wholesalePrice: "",
    minWholesaleQty: "",
    image: "",
    category: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAuthed(localStorage.getItem(ADMIN_AUTH_KEY) === "1");
    const load = async () => {
      try {
        const [p, c] = await Promise.all([DataService.getProducts(), DataService.getCategories()]);
        setProducts(p);
        setCategories(c);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleLogin = () => {
    if (!login.id || !login.pass) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (login.id !== ADMIN_ID || login.pass !== ADMIN_PASS) {
      toast.error("รหัสไม่ถูกต้อง");
      return;
    }
    localStorage.setItem(ADMIN_AUTH_KEY, "1");
    setAuthed(true);
    setLogin({ id: "", pass: "" });
    toast.success("เข้าสู่ระบบแล้ว");
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setAuthed(false);
    toast.success("ออกจากระบบแล้ว");
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("กำลังบีบอัดรูปภาพ...", { id: "compress" });
      const compressed = await compressImage(file);
      setForm(f => ({ ...f, image: compressed }));
      toast.success("บีบอัดรูปภาพเรียบร้อย", { id: "compress" });
    } catch (err) {
      console.error("Image compression failed:", err);
      toast.error("บีบอัดรูปภาพไม่สำเร็จ", { id: "compress" });
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.retailPrice || !form.wholesalePrice || !form.minWholesaleQty) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    try {
      if (editingId) {
        await DataService.updateProduct(editingId, {
          name: form.name,
          description: form.description,
          image: form.image,
          retailPrice: Number(form.retailPrice),
          wholesalePrice: Number(form.wholesalePrice),
          minWholesaleQty: Number(form.minWholesaleQty),
          category: form.category || undefined,
        });
        toast.success("แก้ไขสินค้าแล้ว");
      } else {
        await DataService.addProduct({
          name: form.name,
          description: form.description,
          image: form.image,
          retailPrice: Number(form.retailPrice),
          wholesalePrice: Number(form.wholesalePrice),
          minWholesaleQty: Number(form.minWholesaleQty),
          category: form.category || undefined,
        });
        toast.success("เพิ่มสินค้าแล้ว");
      }
      const [p, c] = await Promise.all([DataService.getProducts(), DataService.getCategories()]);
      setProducts(p);
      setCategories(c);
      setEditingId(null);
      setForm({ name: "", description: "", retailPrice: "", wholesalePrice: "", minWholesaleQty: "", image: "", category: "" });
      setShowForm(false);
    } catch (e) {
      console.error(e);
      toast.error("บันทึกไม่สำเร็จ");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await DataService.deleteProduct(id);
      setProducts(await DataService.getProducts());
      toast.success("ลบสินค้าแล้ว");
    } catch (e) {
      console.error(e);
      toast.error("ลบไม่สำเร็จ");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const updated = await DataService.addCategory(newCategory.trim());
      setCategories(updated);
      setNewCategory("");
      toast.success("เพิ่มหมวดหมู่แล้ว");
    } catch (e) {
      console.error(e);
      toast.error("เพิ่มหมวดหมู่ไม่สำเร็จ");
    }
  };

  const handleDeleteCategory = async (name: string) => {
    try {
      const updated = await DataService.deleteCategory(name);
      setCategories(updated);
      toast.success("ลบหมวดหมู่แล้ว");
    } catch (e) {
      console.error(e);
      toast.error("ลบหมวดหมู่ไม่สำเร็จ");
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      retailPrice: String(product.retailPrice),
      wholesalePrice: String(product.wholesalePrice),
      minWholesaleQty: String(product.minWholesaleQty),
      image: product.image || "",
      category: product.category || "",
    });
    setShowForm(true);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="glass w-full max-w-md rounded-[var(--radius)] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">เข้าสู่ระบบแอดมิน</h1>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="ID"
              value={login.id}
              onChange={(e) => setLogin((s) => ({ ...s, id: e.target.value }))}
              autoComplete="username"
            />
            <Input
              type="password"
              placeholder="Password"
              value={login.pass}
              onChange={(e) => setLogin((s) => ({ ...s, pass: e.target.value }))}
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full gradient-warm text-primary-foreground">
              เข้าสู่ระบบ
            </Button>
          </div>
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
            <h1 className="text-xl font-bold text-foreground">จัดการสินค้า</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout} className="rounded-full">
              ออกจากระบบ
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="rounded-full"
            >
              <Tag className="w-4 h-4 mr-1" /> หมวดหมู่
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gradient-warm text-primary-foreground rounded-full shadow-warm"
            >
              <Plus className="w-4 h-4 mr-1" /> เพิ่มสินค้า
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Category Management */}
        {showCategoryForm && (
          <div className="glass rounded-[var(--radius)] p-6 space-y-4 animate-fade-up">
            <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> จัดการหมวดหมู่
            </h2>

            <div className="flex gap-2">
              <Input
                placeholder="ชื่อหมวดหมู่ใหม่"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddCategory()}
              />
              <Button onClick={handleAddCategory} className="gradient-warm text-primary-foreground shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="text-sm py-1.5 px-3 flex items-center gap-1.5"
                >
                  {cat}
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="glass rounded-[var(--radius)] p-6 space-y-4 animate-fade-up">
            <h2 className="font-semibold text-lg text-foreground">{editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>

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

            {/* Category selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">หมวดหมู่</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: f.category === cat ? "" : cat }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      form.category === cat
                        ? "gradient-warm text-primary-foreground shadow-warm"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="ราคาปลีก"
                value={form.retailPrice ?? ""}
                onChange={e => setForm(f => ({ ...f, retailPrice: e.target.value }))}
              />
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="ราคาส่ง"
                value={form.wholesalePrice ?? ""}
                onChange={e => setForm(f => ({ ...f, wholesalePrice: e.target.value }))}
              />
              <Input
                type="number"
                inputMode="numeric"
                step="1"
                placeholder="ขั้นต่ำ (ชิ้น)"
                value={form.minWholesaleQty ?? ""}
                onChange={e => setForm(f => ({ ...f, minWholesaleQty: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} className="gradient-warm text-primary-foreground flex-1">
                บันทึก
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({ name: "", description: "", retailPrice: "", wholesalePrice: "", minWholesaleQty: "", image: "", category: "" });
                }}
                className="flex-1"
              >
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
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                  {product.category && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {product.category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  ปลีก ฿{product.retailPrice} | ส่ง ฿{product.wholesalePrice} (ขั้นต่ำ {product.minWholesaleQty})
                </p>
              </div>
              <Button variant="outline" onClick={() => startEdit(product)} className="rounded-xl shrink-0">
                แก้ไข
              </Button>
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
