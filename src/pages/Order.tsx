import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Trash2, Facebook, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DataService, type Product } from "@/lib/data-service";

interface CartItem extends Product {
  quantity: number;
}

const Order = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const receiptLogoUrl = "/logo.png";

  useEffect(() => {
    const savedCart = localStorage.getItem("sunny_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const migrated = Array.isArray(parsed)
          ? parsed.map((item: any) => {
              if (!item || typeof item !== "object") return item;
              const image = item.image ?? item.imageUrl ?? item.image_url ?? "";
              return { ...item, image };
            })
          : [];
        setCart(migrated);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sunny_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const loaded = await DataService.getProducts();
        setProducts(loaded);

        // เติมรูปสินค้าในตะกร้า (กรณีตะกร้าเก่าไม่มีรูป หรือรูปเป็นค่าว่าง)
        setCart((prev) =>
          prev.map((item) => {
            if (item?.image) return item;
            const p = loaded.find((x) => x.id === item.id);
            if (p?.image) return { ...item, image: p.image };
            return item;
          })
        );
      } catch (e) {
        console.error(e);
      }
    };
    loadProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success("เพิ่มลงตะกร้าแล้ว");
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success("ลบออกจากตะกร้าแล้ว");
  };

  const getTotal = () => {
    return cart.reduce(
      (sum, item) =>
        sum +
        (item.quantity >= item.minWholesaleQty
          ? item.wholesalePrice
          : item.retailPrice) *
          item.quantity,
      0
    );
  };

  const generateOrderSummary = () => {
    const items = cart
      .map(
        (item) =>
          `${item.name} x${item.quantity} = ฿${
            item.quantity >= item.minWholesaleQty
              ? item.wholesalePrice
              : item.retailPrice
          }/ชิ้น`
      )
      .join("\n");

    const total = getTotal();
    const summary = `📋 รายการสั่งซื้อ\n${items}\n\n💰 รวมทั้งหมด: ฿${total}\n\n👤 ข้อมูลผู้สั่ง\nชื่อ: ${customerInfo.name}\nเบอร์โทร: ${customerInfo.phone}\nที่อยู่: ${customerInfo.address}\nหมายเหตุ: ${customerInfo.note}`;

    return summary;
  };

  const handlePrintReceipt = async () => {
    if (cart.length === 0) {
      toast.error("กรุณาเลือกสินค้าก่อน");
      return;
    }
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("กรุณากรอกชื่อและเบอร์โทร");
      return;
    }

    // สร้างใบเสร็จ
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 400;
    const baseHeight = 260;
    const lineHeight = 20;
    const listHeight = cart.length * lineHeight;
    const footerHeight = 120;
    canvas.width = width;
    canvas.height = baseHeight + listHeight + footerHeight;

    // พื้นหลังขาว
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // หัวข้อความ
    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ใบเสร็จ กรุ้งกริ้ง ทอดกรอบ", canvas.width / 2, 40);

    ctx.font = "14px Arial";
    ctx.fillText("--------------------------------", canvas.width / 2, 60);

    // ข้อมูลลูกค้า
    ctx.textAlign = "left";
    ctx.fillText(`ชื่อ: ${customerInfo.name}`, 40, 90);
    ctx.fillText(`เบอร์โทร: ${customerInfo.phone}`, 40, 110);
    if (customerInfo.address) {
      ctx.fillText(`ที่อยู่: ${customerInfo.address}`, 40, 130);
    }
    if (customerInfo.note) {
      ctx.fillText(`หมายเหตุ: ${customerInfo.note}`, 40, 150);
    }

    ctx.fillText("--------------------------------", 40, 170);

    // รายการสินค้า
    let y = 200;
    ctx.font = "12px Arial";
    cart.forEach((item) => {
      const price = item.quantity >= item.minWholesaleQty ? item.wholesalePrice : item.retailPrice;
      const total = price * item.quantity;
      
      ctx.fillText(`${item.name}`, 40, y);
      ctx.fillText(`x${item.quantity}`, 250, y);
      ctx.fillText(`฿${total}`, 320, y);
      y += 20;
    });

    ctx.fillText("--------------------------------", 40, y);
    y += 20;

    // รวมเงิน
    ctx.font = "bold 16px Arial";
    ctx.fillText(`รวมทั้งหมด: ฿${getTotal()}`, 40, y);

    // โลโก้ด้านล่าง
    try {
      const logo = new window.Image();
      logo.crossOrigin = "anonymous";
      const logoLoaded = new Promise<void>((resolve, reject) => {
        logo.onload = () => resolve();
        logo.onerror = () => reject(new Error("Failed to load logo"));
      });
      logo.src = receiptLogoUrl;
      await logoLoaded;

      const logoMaxWidth = 110;
      const scale = Math.min(1, logoMaxWidth / logo.width);
      const logoW = Math.round(logo.width * scale);
      const logoH = Math.round(logo.height * scale);
      const logoY = Math.min(canvas.height - logoH - 18, y + 30);
      const logoX = Math.round((canvas.width - logoW) / 2);
      ctx.drawImage(logo, logoX, logoY, logoW, logoH);
    } catch (e) {
      console.error(e);
    }

    // แปลงเป็นรูป
    const imageUrl = canvas.toDataURL("image/png");
    setReceiptImage(imageUrl);
    toast.success('สร้างใบเสร็จแล้ว');
  };

  const handleDownloadReceipt = () => {
    if (!receiptImage) {
      toast.error("กรุณาพิมพ์ใบเสร็จก่อน");
      return;
    }

    const a = document.createElement("a");
    a.href = receiptImage;
    a.download = `receipt-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSendReceiptToFacebook = () => {
    if (!receiptImage) {
      toast.error("กรุณาจับภาพใบเสร็จก่อน");
      return;
    }

    const popup = window.open("about:blank", "_blank", "noopener,noreferrer");
    if (!popup) {
      toast.error("เบราว์เซอร์บล็อกหน้าต่างใหม่ กรุณาอนุญาต Pop-up แล้วลองอีกครั้ง");
      return;
    }

    const summary = generateOrderSummary();
    const message = `📸 ใบเสร็จการสั่งซื้อ\n\n${summary}\n\n🖼️ รูปใบเสร็จ:`;
    const encoded = encodeURIComponent(message);
    const fbUrl = `https://www.facebook.com/Kenginol.ar/messages/?text=${encoded}`;

    try {
      popup.location.href = fbUrl;
      toast.success("เปิดหน้า Facebook แล้ว");
    } catch (e) {
      console.error(e);
      popup.close();
      toast.error("เปิดหน้า Facebook ไม่สำเร็จ");
    }

    // Best-effort: copy the message so user can paste if FB doesn't prefill.
    void navigator.clipboard
      ?.writeText(message)
      .then(() => toast.success("คัดลอกข้อความใบเสร็จแล้ว (วางในแชทได้เลย)"))
      .catch(() => {
        // ignore
      });
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
            <h1 className="text-xl font-bold text-foreground">สั่งซื้อสินค้า</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Customer Info */}
        <div className="glass rounded-[var(--radius)] p-4 space-y-3">
          <h2 className="font-semibold text-lg text-foreground">ข้อมูลผู้สั่งซื้อ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="ชื่อ-นามสกุล"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo((s) => ({ ...s, name: e.target.value }))}
            />
            <Input
              placeholder="เบอร์โทรศัพท์"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>
          <Textarea
            placeholder="ที่อยู่จัดส่ง"
            value={customerInfo.address}
            onChange={(e) => setCustomerInfo((s) => ({ ...s, address: e.target.value }))}
            rows={2}
          />
          <Textarea
            placeholder="หมายเหตุ (ถ้ามี)"
            value={customerInfo.note}
            onChange={(e) => setCustomerInfo((s) => ({ ...s, note: e.target.value }))}
            rows={2}
          />
        </div>

        {/* Cart */}
        <div className="glass rounded-[var(--radius)] p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-lg text-foreground">ตะกร้าสินค้า</h2>
            <div className="text-sm text-muted-foreground">รวม ฿{getTotal()}</div>
          </div>
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">ยังไม่มีสินค้าในตะกร้า</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={() => {
                          setCart((prev) => prev.map((p) => (p.id === item.id ? { ...p, image: "" } : p)));
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">
                        ไม่มีรูป
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                      {item.category && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ฿{item.quantity >= item.minWholesaleQty ? item.wholesalePrice : item.retailPrice}/ชิ้น
                      {item.quantity < item.minWholesaleQty && (
                        <span className="text-xs text-primary ml-1">(ขั้นต่ำ {item.minWholesaleQty} ชิ้น ราคาส่ง)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 p-0">
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 p-0">
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Receipt Actions */}
        <div className="glass rounded-[var(--radius)] p-4 space-y-3">
          <h2 className="font-semibold text-lg text-foreground">ใบเสร็จ</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handlePrintReceipt} className="gradient-warm text-primary-foreground flex-1">
              <Image className="w-4 h-4 mr-1" /> พิมพ์ใบเสร็จ
            </Button>
            <Button variant="outline" onClick={handleDownloadReceipt} className="flex-1">
              บันทึกใบเสร็จ
            </Button>
          </div>

          {receiptImage && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg overflow-auto">
                <img
                  src={receiptImage}
                  alt="ใบเสร็จ"
                  className="w-full max-w-[360px] mx-auto rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setReceiptImage(null)} className="flex-1">
                  ลบใบเสร็จ
                </Button>
                <Button onClick={handleSendReceiptToFacebook} className="gradient-warm text-primary-foreground flex-1">
                  <Facebook className="w-4 h-4 mr-1" /> ส่งรูปไป Facebook
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
