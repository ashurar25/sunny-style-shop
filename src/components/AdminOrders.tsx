import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Package, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_note: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  foam_box_fee: number;
  grand_total: number;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "confirmed", label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "shipping", label: "กำลังจัดส่ง", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "completed", label: "สำเร็จ", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "cancelled", label: "ยกเลิก", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
];

function getStatusInfo(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("โหลดออเดอร์ไม่สำเร็จ");
    } else {
      setOrders((data || []).map((o: any) => ({
        ...o,
        items: Array.isArray(o.items) ? o.items : [],
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("อัปเดตสถานะไม่สำเร็จ");
    } else {
      toast.success(`อัปเดตสถานะเป็น "${getStatusInfo(status).label}"`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>ยังไม่มีออเดอร์</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map(order => {
        const expanded = expandedId === order.id;
        const statusInfo = getStatusInfo(order.status);
        return (
          <div key={order.id} className="glass rounded-[var(--radius)] overflow-hidden">
            <button
              onClick={() => setExpandedId(expanded ? null : order.id)}
              className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{order.customer_name || "ไม่ระบุชื่อ"}</span>
                  <Badge className={`text-xs border-0 ${statusInfo.color}`}>{statusInfo.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {new Date(order.created_at).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                  {" · "}฿{Number(order.grand_total).toLocaleString()}
                </p>
              </div>
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </button>

            {expanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3 animate-fade-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">โทร:</span> {order.customer_phone || "-"}</div>
                  <div><span className="text-muted-foreground">ที่อยู่:</span> {order.customer_address || "-"}</div>
                  {order.customer_note && <div className="sm:col-span-2"><span className="text-muted-foreground">หมายเหตุ:</span> {order.customer_note}</div>}
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  {order.items.map((item: OrderItem, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>฿{Number(item.subtotal).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-1 mt-2 space-y-0.5 text-sm">
                    <div className="flex justify-between"><span>ค่าสินค้า</span><span>฿{Number(order.subtotal).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>ค่าส่ง</span><span>฿{Number(order.shipping_fee).toLocaleString()}</span></div>
                    {Number(order.foam_box_fee) > 0 && <div className="flex justify-between"><span>ค่ากล่องโฟม</span><span>฿{Number(order.foam_box_fee).toLocaleString()}</span></div>}
                    <div className="flex justify-between font-bold text-foreground pt-1"><span>รวมทั้งหมด</span><span>฿{Number(order.grand_total).toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <Button
                      key={s.value}
                      size="sm"
                      variant={order.status === s.value ? "default" : "outline"}
                      className="rounded-full text-xs"
                      onClick={() => updateStatus(order.id, s.value)}
                      disabled={order.status === s.value}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminOrders;
