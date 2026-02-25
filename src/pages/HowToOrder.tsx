import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Facebook, Copy, ShoppingCart, Home } from "lucide-react";

const LINE_URL = "https://line.me/ti/p/o6v8FE_0QN";
const FACEBOOK_PAGE_URL = "https://www.facebook.com/krungkringtodkrob";
const MESSENGER_URLS = [
  "https://m.me/krungkringtodkrob",
  "https://www.messenger.com/t/krungkringtodkrob",
];

const copyText = async (text: string, successMsg: string) => {
  try {
    await navigator.clipboard?.writeText(text);
    toast.success(successMsg);
  } catch {
    toast.error("คัดลอกไม่สำเร็จ");
  }
};

const openTopLevel = (url: string) => {
  try {
    (window.top || window).location.href = url;
  } catch {
    window.location.href = url;
  }
};

const StepIllustration = ({ title, steps }: { title: string; steps: string[] }) => {
  const w = 920;
  const h = 220;
  const pad = 24;
  const boxW = (w - pad * 2 - 20 * (steps.length - 1)) / steps.length;

  return (
    <div className="glass rounded-2xl p-5 border border-border">
      <div className="font-bold text-foreground mb-3">{title}</div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="min-w-[740px] w-full"
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id="warm" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={w} height={h} rx="20" fill="url(#warm)" />

          {steps.map((s, i) => {
            const x = pad + i * (boxW + 20);
            const y = 56;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={boxW}
                  height={120}
                  rx="16"
                  fill="rgba(255,255,255,0.55)"
                  stroke="rgba(0,0,0,0.08)"
                />
                <text x={x + 18} y={y + 34} fontSize="18" fontWeight="700" fill="rgba(0,0,0,0.82)">
                  {`ขั้นตอน ${i + 1}`}
                </text>
                <foreignObject x={x + 18} y={y + 44} width={boxW - 36} height={72}>
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      fontSize: 14,
                      lineHeight: 1.35,
                      color: "rgba(0,0,0,0.72)",
                      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
                    }}
                  >
                    {s}
                  </div>
                </foreignObject>

                {i < steps.length - 1 && (
                  <g>
                    <line
                      x1={x + boxW + 6}
                      y1={y + 60}
                      x2={x + boxW + 14}
                      y2={y + 60}
                      stroke="rgba(0,0,0,0.35)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <polygon
                      points={`${x + boxW + 18},${y + 60} ${x + boxW + 10},${y + 54} ${x + boxW + 10},${y + 66}`}
                      fill="rgba(0,0,0,0.35)"
                    />
                  </g>
                )}
              </g>
            );
          })}

          <text x={pad} y={34} fontSize="16" fontWeight="700" fill="rgba(0,0,0,0.72)">
            {"ภาพตัวอย่างขั้นตอน"}
          </text>
        </svg>
      </div>
    </div>
  );
};

const HowToOrder = () => {
  const handleOpenLine = () => openTopLevel(LINE_URL);
  const handleCopyLine = () => copyText(LINE_URL, "คัดลอกลิงก์ Line แล้ว");

  const handleOpenFacebookPage = () => openTopLevel(FACEBOOK_PAGE_URL);
  const handleCopyFacebookPage = () => copyText(FACEBOOK_PAGE_URL, "คัดลอกลิงก์ Facebook แล้ว");

  const handleOpenMessenger = () => {
    for (const url of MESSENGER_URLS) {
      try {
        openTopLevel(url);
        return;
      } catch {
        continue;
      }
    }
    toast.error("เปิด Messenger ไม่สำเร็จ");
  };

  const handleCopyMessenger = () => copyText(MESSENGER_URLS[0], "คัดลอกลิงก์ Messenger แล้ว");

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">วิธีสั่งสินค้า</h1>
            <div className="text-xs text-muted-foreground">สั่งผ่าน Line หรือ Facebook (Messenger)</div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <section className="glass rounded-2xl p-6 border border-border">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <div className="text-sm font-semibold text-primary tracking-widest uppercase">เริ่มต้น</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mt-1">เพิ่มสินค้าเข้าตะกร้า</h2>
              <p className="text-muted-foreground mt-2">
                เลือกสินค้าที่ต้องการ แล้วกด “เพิ่มลงตะกร้า” จากนั้นกดปุ่มตะกร้ามุมขวาล่างเพื่อไปหน้าสั่งซื้อ
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Link to="/">
                <Button variant="outline" className="w-full md:w-auto">
                  <Home className="w-4 h-4 mr-1" /> ไปหน้าแรก
                </Button>
              </Link>
              <Link to="/order">
                <Button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-600/90 text-white">
                  <ShoppingCart className="w-4 h-4 mr-1" /> ไปหน้าตะกร้า
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-5">
            <StepIllustration
              title="เพิ่มสินค้าเข้าตะกร้า"
              steps={[
                "เลื่อนดูสินค้า หรือค้นหาชื่อสินค้า",
                "กดปุ่ม เพิ่มลงตะกร้า ที่การ์ดสินค้า",
                "กดไอคอนตะกร้ามุมขวาล่าง ไปหน้าสั่งซื้อ",
              ]}
            />
          </div>
        </section>

        <section className="glass rounded-2xl p-6 border border-border">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <div className="text-sm font-semibold text-primary tracking-widest uppercase">แนะนำ</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mt-1">สั่งผ่าน Line (เร็วสุด)</h2>
              <p className="text-muted-foreground mt-2">
                เหมาะสำหรับลูกค้าที่ต้องการสั่งซื้อไว และมักไม่เจอปัญหาลิงก์ถูกบล็อกในคอม
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button onClick={handleOpenLine} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-600/90 text-white">
                <MessageCircle className="w-4 h-4 mr-1" /> เปิด Line
              </Button>
              <Button variant="outline" onClick={handleCopyLine} className="flex-1 md:flex-none">
                <Copy className="w-4 h-4 mr-1" /> คัดลอกลิงก์
              </Button>
            </div>
          </div>

          <div className="mt-5">
            <StepIllustration
              title="สั่งผ่าน Line"
              steps={[
                "กดปุ่ม เปิด Line หรือคัดลอกลิงก์",
                "ส่งข้อความ: ชื่อสินค้า + จำนวน + เบอร์โทร",
                "รอร้านยืนยันยอดและจัดส่ง แล้วชำระเงินตามแจ้ง",
              ]}
            />
          </div>
        </section>

        <section className="glass rounded-2xl p-6 border border-border">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <div className="text-sm font-semibold text-primary tracking-widest uppercase">สำรอง</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mt-1">สั่งผ่าน Facebook (Messenger)</h2>
              <p className="text-muted-foreground mt-2">
                ถ้าคอมคุณเปิด Facebook ไม่ได้ แนะนำให้สั่งผ่าน Line หรือเปิดจากมือถือแทน
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto flex-col sm:flex-row">
              <Button onClick={handleOpenMessenger} className="flex-1 md:flex-none gradient-warm text-primary-foreground">
                <MessageCircle className="w-4 h-4 mr-1" /> เปิด Messenger
              </Button>
              <Button variant="outline" onClick={handleCopyMessenger} className="flex-1 md:flex-none">
                <Copy className="w-4 h-4 mr-1" /> คัดลอกลิงก์
              </Button>
              <Button variant="outline" onClick={handleOpenFacebookPage} className="flex-1 md:flex-none">
                <Facebook className="w-4 h-4 mr-1" /> เปิดเพจ
              </Button>
              <Button variant="outline" onClick={handleCopyFacebookPage} className="flex-1 md:flex-none">
                <Copy className="w-4 h-4 mr-1" /> คัดลอกลิงก์
              </Button>
            </div>
          </div>

          <div className="mt-5">
            <StepIllustration
              title="สั่งผ่าน Facebook"
              steps={[
                "กดปุ่ม เปิด Messenger หรือคัดลอกลิงก์",
                "ส่งรูป/ชื่อสินค้า + จำนวน + ที่อยู่จัดส่ง",
                "รอร้านยืนยันยอด รวมค่าส่ง/กล่องโฟม แล้วชำระเงิน",
              ]}
            />
          </div>
        </section>

        <section className="glass rounded-2xl p-6 border border-border">
          <h3 className="font-bold text-foreground text-lg">ทิปสำคัญ</h3>
          <div className="mt-2 text-sm text-muted-foreground space-y-2">
            <div>1) ถ้าคอมเปิด Facebook ไม่ได้ ให้สั่งผ่าน Line เป็นหลัก</div>
            <div>2) ถ้าเปิดจากคอมไม่ได้ แต่เปิดจากมือถือได้ ให้คัดลอกลิงก์ไปเปิดในมือถือ</div>
            <div>3) หน้า “สั่งซื้อ” มีปุ่มคัดลอกข้อความสรุป ช่วยให้สั่งเร็วขึ้น</div>
          </div>
          <div className="mt-4">
            <Link to="/order">
              <Button className="gradient-warm text-primary-foreground w-full sm:w-auto">ไปหน้าสั่งซื้อ</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HowToOrder;
