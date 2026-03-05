import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Phone, MapPin, LogOut, Package } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [showOrders, setShowOrders] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          phone: form.phone,
          address: form.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("บันทึกข้อมูลเรียบร้อย");
    } catch (err: any) {
      toast.error(err.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const loadOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setOrders(data || []);
    setShowOrders(true);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("ออกจากระบบแล้ว");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">โปรไฟล์</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-destructive">
            <LogOut className="w-4 h-4 mr-1" /> ออก
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile info */}
        <div className="glass rounded-[var(--radius)] p-6 space-y-4">
          <p className="text-sm text-muted-foreground">{user?.email}</p>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ชื่อ-นามสกุล"
              value={form.full_name}
              onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
              className="pl-10 h-12 rounded-xl"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="เบอร์โทร"
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              className="pl-10 h-12 rounded-xl"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Textarea
              placeholder="ที่อยู่จัดส่ง"
              value={form.address}
              onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
              className="pl-10 rounded-xl min-h-[80px]"
              rows={3}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gradient-warm text-primary-foreground rounded-xl shadow-warm"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </div>

        {/* Order history */}
        <div className="glass rounded-[var(--radius)] p-6 space-y-4">
          <Button
            variant="outline"
            onClick={loadOrders}
            className="w-full rounded-xl h-12 gap-2"
          >
            <Package className="w-5 h-5" /> ดูประวัติการสั่งซื้อ
          </Button>

          {showOrders && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีประวัติการสั่งซื้อ</p>
              ) : (
                orders.map((order) => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  return (
                    <div key={order.id} className="bg-muted/50 rounded-xl p-4 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {new Date(order.created_at).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="font-bold text-primary">
                          ฿{Number(order.grand_total).toLocaleString("th-TH")}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {items.map((it: any, i: number) => (
                          <span key={i}>
                            {it.name} x{it.quantity}
                            {i < items.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
