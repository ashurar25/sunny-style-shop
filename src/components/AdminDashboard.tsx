import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: orders } = await supabase
          .from("orders")
          .select("grand_total, status");

        if (orders) {
          setStats({
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, o) => sum + Number(o.grand_total), 0),
            pendingOrders: orders.filter((o) => o.status === "pending").length,
            completedOrders: orders.filter((o) => o.status === "completed").length,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: "ออเดอร์ทั้งหมด",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "ยอดขายรวม",
      value: `฿${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "รอดำเนินการ",
      value: stats.pendingOrders,
      icon: Package,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "สำเร็จแล้ว",
      value: stats.completedOrders,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
