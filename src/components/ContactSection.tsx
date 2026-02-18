import { motion } from "framer-motion";
import { Phone, MessageCircle, Facebook } from "lucide-react";

const contacts = [
  {
    icon: Phone,
    label: "โทรศัพท์",
    value: "092-443-4311",
    href: "tel:0924434311",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MessageCircle,
    label: "Line",
    value: "@kenginol.ar",
    href: "https://line.me/ti/p/@kenginol.ar",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Facebook,
    label: "Facebook",
    value: "kenginol.ar",
    href: "https://facebook.com/kenginol.ar",
    color: "bg-blue-100 text-blue-600",
  },
];

const ContactSection = () => {
  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          ติดต่อเรา
        </h2>
        <p className="text-muted-foreground mb-10">
          สั่งซื้อสินค้าหรือสอบถามรายละเอียดเพิ่มเติม
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {contacts.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-[var(--radius)] p-6 flex flex-col items-center gap-3 hover:shadow-warm transition-all hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${c.color}`}>
                <c.icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-foreground">{c.label}</span>
              <span className="text-sm text-muted-foreground">{c.value}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
