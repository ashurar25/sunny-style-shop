import { motion } from "framer-motion";
import { Phone, MessageCircle, Facebook } from "lucide-react";

const contacts = [
  {
    icon: Phone,
    label: "โทรศัพท์",
    value: "092-443-4311",
    href: "tel:0924434311",
    gradient: "from-primary/15 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: MessageCircle,
    label: "Line",
    value: "เพิ่มเพื่อนในไลน์",
    href: "https://line.me/ti/p/o6v8FE_0QN",
    gradient: "from-emerald-500/15 to-emerald-500/5",
    iconColor: "text-emerald-600",
  },
  {
    icon: Facebook,
    label: "Facebook",
    value: "krungkringtodkrob",
    href: "https://www.facebook.com/krungkringtodkrob",
    gradient: "from-blue-500/15 to-blue-500/5",
    iconColor: "text-blue-600",
  },
];

const ContactSection = () => {
  return (
    <section className="py-10 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-muted/50" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-semibold text-primary tracking-widest uppercase">ช่องทางการสั่งซื้อ</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mt-2 mb-4">
            ติดต่อเรา
          </h2>
          <p className="text-muted-foreground text-base mb-6">
            สั่งซื้อสินค้าหรือสอบถามรายละเอียดเพิ่มเติม
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {contacts.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              onClick={(e) => {
                // Facebook blocks loading inside iframes (ERR_BLOCKED_BY_RESPONSE).
                // Use top-level navigation to escape the iframe.
                e.preventDefault();
                try {
                  (window.top || window).location.href = c.href;
                } catch {
                  window.location.href = c.href;
                }
              }}
              target="_top"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-warm transition-all duration-300 group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <c.icon className={`w-7 h-7 ${c.iconColor}`} />
              </div>
              <div>
                <span className="font-bold text-foreground text-lg block">{c.label}</span>
                <span className="text-sm text-muted-foreground mt-1 block">{c.value}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
