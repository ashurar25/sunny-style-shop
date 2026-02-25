import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Trash2, Facebook, Image, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DataService, type Product } from "@/lib/data-service";

interface CartItem extends Product {
  quantity: number;
}

const formatTHB = (amount: number) => {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `฿${safe.toLocaleString("th-TH")}`;
};

const FACEBOOK_PAGE_URL = "https://www.facebook.com/krungkringtodkrob";
const MESSENGER_PAGE_URLS = [
  "https://m.me/krungkringtodkrob",
  "https://www.messenger.com/t/krungkringtodkrob",
];

const MESSENGER_CHAT_URLS = [
  // messenger.com is often less restricted than facebook.com in some environments
  // Official Facebook Page: https://www.facebook.com/krungkringtodkrob
  // Prefer m.me for page chat, fallback to messenger.com thread.
  ...MESSENGER_PAGE_URLS,
];

type StoredCartItem = { id: string; quantity: number };

type OrderErrorBoundaryState = { hasError: boolean; message: string };

class OrderErrorBoundary extends React.Component<React.PropsWithChildren, OrderErrorBoundaryState> {
  declare state: OrderErrorBoundaryState;

  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="glass w-full max-w-md rounded-[var(--radius)] p-6 space-y-3">
            <div className="text-lg font-semibold text-foreground">หน้าออเดอร์มีปัญหา</div>
            <div className="text-sm text-muted-foreground break-words">{this.state.message}</div>
            <div className="text-xs text-muted-foreground">ลองรีเฟรชหน้า หรือแจ้งข้อความนี้ให้ผู้ดูแล</div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
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
  const cartFallbackImageUrl = "/placeholder.svg";

  const CART_STORAGE_KEY_V2 = "sunny_cart_v2";
  const CART_STORAGE_KEY_V1 = "sunny_cart";
  const CUSTOMER_STORAGE_KEY = "sunny_customer_info_v1";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      setCustomerInfo((s) => ({
        ...s,
        name: typeof (parsed as any).name === "string" ? (parsed as any).name : s.name,
        phone: typeof (parsed as any).phone === "string" ? (parsed as any).phone : s.phone,
        address: typeof (parsed as any).address === "string" ? (parsed as any).address : s.address,
        note: typeof (parsed as any).note === "string" ? (parsed as any).note : s.note,
      }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const savedV2 = localStorage.getItem(CART_STORAGE_KEY_V2);
    if (savedV2) {
      try {
        const parsed = JSON.parse(savedV2);
        const minimal: StoredCartItem[] = Array.isArray(parsed) ? parsed : [];
        // Hydration happens after products load
        setCart(minimal.map((x) => ({
          id: x.id,
          quantity: x.quantity,
          name: "",
          image: "",
          retailPrice: 0,
          wholesalePrice: 0,
          minWholesaleQty: 0,
        })) as unknown as CartItem[]);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Migration from legacy V1 (may contain huge base64 images and exceed quota)
    const savedV1 = localStorage.getItem(CART_STORAGE_KEY_V1);
    if (!savedV1) return;
    try {
      const parsed = JSON.parse(savedV1);
      const minimal: StoredCartItem[] = Array.isArray(parsed)
        ? parsed
            .filter((x: any) => x && typeof x === "object" && x.id)
            .map((x: any) => ({ id: String(x.id), quantity: Number(x.quantity ?? 1) }))
        : [];
      try {
        localStorage.setItem(CART_STORAGE_KEY_V2, JSON.stringify(minimal));
      } catch (e) {
        console.error(e);
        // As a last resort, clear legacy cart to prevent app crash
        localStorage.removeItem(CART_STORAGE_KEY_V1);
      }
      setCart(minimal.map((x) => ({
        id: x.id,
        quantity: x.quantity,
        name: "",
        image: "",
        retailPrice: 0,
        wholesalePrice: 0,
        minWholesaleQty: 0,
      })) as unknown as CartItem[]);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    // Persist minimal cart only to avoid localStorage quota exceeded (base64 images are huge)
    const minimal: StoredCartItem[] = cart.map((i) => ({ id: i.id, quantity: i.quantity }));
    try {
      localStorage.setItem(CART_STORAGE_KEY_V2, JSON.stringify(minimal));
      // same-tab listeners won't receive the 'storage' event, so dispatch a custom event
      window.dispatchEvent(new Event("sunny-cart-updated"));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerInfo));
    } catch {
      // ignore
    }
  }, [customerInfo]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const loaded = await DataService.getProducts();
        setProducts(loaded);

        // Hydrate cart items from products
        setCart((prev) =>
          prev
            .map((item) => {
              const p = loaded.find((x) => x.id === item.id);
              if (!p) return null;
              return { ...p, quantity: item.quantity };
            })
            .filter(Boolean) as CartItem[]
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
    const summary = `📋 รายการสั่งซื้อ\n${items}\n\n💰 ยอดรวมทั้งสิ้น: ${formatTHB(total)}\n\n👤 ข้อมูลผู้สั่ง\nชื่อ: ${customerInfo.name}\nเบอร์โทร: ${customerInfo.phone}\nที่อยู่: ${customerInfo.address}\nหมายเหตุ: ${customerInfo.note}`;

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
    ctx.fillText("ใบเสร็จ กรุ๊งกริ๊ง ทอดกรอบ", canvas.width / 2, 40);

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
    const grandTotal = getTotal();
    ctx.textAlign = "left";
    ctx.fillText("ยอดรวมทั้งสิ้น", 40, y);
    ctx.textAlign = "right";
    ctx.fillText(formatTHB(grandTotal), canvas.width - 40, y);
    ctx.textAlign = "left";

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

  const copyReceiptMessageBestEffort = async (message: string) => {
    try {
      await navigator.clipboard?.writeText(message);
      toast.success("คัดลอกข้อความใบเสร็จแล้ว (วางในแชทได้เลย)");
    } catch {
      // ignore
    }
  };

  const openExternalBestEffort = (url: string) => {
    // Facebook blocks rendering inside iframes (ERR_BLOCKED_BY_RESPONSE).
    // Navigate the top-level window to escape the iframe.
    try {
      (window.top || window).location.href = url;
    } catch {
      window.location.href = url;
    }
  };

  const openMessengerChat = () => {
    // Try multiple URLs; if popups are blocked, user can use the copy-link fallback.
    try {
      openExternalBestEffort(MESSENGER_CHAT_URLS[0]);
      return;
    } catch {
      // ignore
    }
    try {
      openExternalBestEffort(MESSENGER_CHAT_URLS[1]);
    } catch {
      // ignore
    }
  };

  const buildReceiptMessage = () => {
    const summary = generateOrderSummary();
    return `📸 ใบเสร็จการสั่งซื้อ\n\n${summary}\n\n🖼️ แนบรูปใบเสร็จที่บันทึกไว้ (ไฟล์ receipt.png)`;
  };

  const handleCopyReceiptMessage = async () => {
    const message = buildReceiptMessage();
    try {
      await navigator.clipboard?.writeText(message);
      toast.success("คัดลอกข้อความแล้ว");
    } catch {
      toast.error("คัดลอกไม่สำเร็จ ลองคัดลอกด้วยตนเอง");
    }
  };

  const handleSendReceiptToFacebook = async () => {
    if (!receiptImage) {
      toast.error("กรุณาจับภาพใบเสร็จก่อน");
      return;
    }

    const message = buildReceiptMessage();
    // Note: Facebook does not reliably support pre-filling message text via URL.
    // Best UX: open chat and auto-copy text for paste.
    openMessengerChat();
    toast.success("เปิด Messenger แล้ว (ถ้าไม่เปิด ให้กดคัดลอกลิงก์)");
    await copyReceiptMessageBestEffort(message);
  };

  const handleCopyMessengerLink = async () => {
    const url = MESSENGER_CHAT_URLS[0];
    try {
      await navigator.clipboard?.writeText(url);
      toast.success("คัดลอกลิงก์ Messenger แล้ว");
    } catch {
      toast.error("คัดลอกลิงก์ไม่สำเร็จ");
    }
  };

  const handleCopyFacebookPageLink = async () => {
    try {
      await navigator.clipboard?.writeText(FACEBOOK_PAGE_URL);
      toast.success("คัดลอกลิงก์เพจ Facebook แล้ว");
    } catch {
      toast.error("คัดลอกลิงก์ไม่สำเร็จ");
    }
  };

  const handleSendReceiptToLine = async () => {
    if (!receiptImage) {
      toast.error("กรุณาจับภาพใบเสร็จก่อน");
      return;
    }

    const message = buildReceiptMessage();
    const lineUrl = "https://line.me/ti/p/o6v8FE_0QN";
    openExternalBestEffort(lineUrl);
    toast.success("เปิด Line แล้ว");
    await copyReceiptMessageBestEffort(message);
  };

  return (
    <OrderErrorBoundary>
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
                    <img
                      src={item.image || cartFallbackImageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src.endsWith(cartFallbackImageUrl)) return;
                        img.src = cartFallbackImageUrl;
                      }}
                    />
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
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleCopyReceiptMessage} className="flex-1">
                  คัดลอกข้อความสรุป
                </Button>
                <Button variant="outline" onClick={handleCopyMessengerLink} className="flex-1">
                  คัดลอกลิงก์ Messenger
                </Button>
                <Button variant="outline" onClick={handleCopyFacebookPageLink} className="flex-1">
                  คัดลอกลิงก์เพจ Facebook
                </Button>
                <Button variant="outline" onClick={handleDownloadReceipt} className="flex-1">
                  บันทึกใบเสร็จ
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                ถ้า Facebook/Messenger เปิดไม่ได้ในอุปกรณ์ของคุณ ให้ใช้ Line เป็นช่องทางหลัก (แนะนำ)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setReceiptImage(null)} className="flex-1">
                  ลบใบเสร็จ
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSendReceiptToLine}
                  className="flex-1"
                  title="เปิด Line แล้ววางข้อความ และแนบรูปใบเสร็จ"
                >
                  <MessageCircle className="w-4 h-4 mr-1" /> ส่งไป Line
                </Button>
                <Button
                  onClick={handleSendReceiptToFacebook}
                  className="gradient-warm text-primary-foreground flex-1"
                  title="เปิด Messenger แล้ววางข้อความ และแนบรูปใบเสร็จ"
                >
                  <Facebook className="w-4 h-4 mr-1" /> ส่งไป Facebook
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </OrderErrorBoundary>
  );
};

export default Order;
