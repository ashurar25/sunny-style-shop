import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  return (
    <section className="gradient-hero min-h-[62vh] flex flex-col items-center justify-center px-4 pt-10 pb-12 relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.28] [background:radial-gradient(circle_at_20%_12%,hsla(var(--primary)/0.12),transparent_55%),radial-gradient(circle_at_80%_22%,hsla(var(--secondary)/0.10),transparent_50%),radial-gradient(circle_at_55%_78%,hsla(var(--accent)/0.10),transparent_55%)]" />
        <motion.div
          initial={false}
          className="absolute top-[8%] left-[8%] w-20 h-20 rounded-3xl bg-primary/8 rotate-12"
        />
        <motion.div
          initial={false}
          className="absolute top-[20%] right-[10%] w-16 h-16 rounded-full bg-secondary/15"
        />
        <motion.div
          initial={false}
          className="absolute bottom-[25%] left-[15%] w-12 h-12 rounded-2xl bg-accent/10 -rotate-12"
        />
        <motion.div
          initial={false}
          className="absolute bottom-[15%] right-[12%] w-24 h-24 rounded-full bg-primary/5"
        />
        {/* Large background blurs */}
        <div className="absolute top-[5%] left-[0%] w-72 h-72 rounded-full bg-primary/6 blur-[100px]" />
        <div className="absolute bottom-[0%] right-[0%] w-80 h-80 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* Logo with premium frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative will-change-transform"
      >
        {/* Glow ring */}
        <div className="absolute -inset-6 rounded-[3.25rem] bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/14 blur-2xl" />
        
        <div className="relative w-52 h-52 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-[2.5rem] gradient-card shadow-warm border border-border/35 flex items-center justify-center p-6 backdrop-blur-sm">
          <img
            src={logo}
            alt="กรุ๊งกริ๊ง ทอดกรอบ"
            loading="eager"
            decoding="async"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mt-7 space-y-2"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-[1.08]">
          <span className="text-foreground/90">
            กรุ๊งกริ๊ง{" "}
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/90 to-accent/90">
            ทอดกรอบ
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-normal max-w-md mx-auto leading-relaxed">
          อาหารสด • แปรรูป • แช่แข็ง • อร่อยทุกคำ สดใหม่ทุกวัน
        </p>
      </motion.div>

      <motion.a
        href="#products"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-7 gradient-warm text-primary-foreground px-7 py-2.5 rounded-full font-semibold text-sm sm:text-base shadow-warm cursor-pointer inline-flex items-center gap-2 ring-1 ring-white/25"
      >
        ดูสินค้าทั้งหมด
        <ChevronDown className="w-5 h-5" />
      </motion.a>
    </section>
  );
};

export default Hero;
