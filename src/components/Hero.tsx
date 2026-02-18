import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  return (
    <section className="gradient-hero min-h-[60vh] flex flex-col items-center justify-center px-4 pt-8 pb-10 relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[8%] left-[8%] w-20 h-20 rounded-3xl bg-primary/8 rotate-12"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-16 h-16 rounded-full bg-secondary/15"
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] left-[15%] w-12 h-12 rounded-2xl bg-accent/10 -rotate-12"
        />
        <motion.div
          animate={{ y: [0, 18, 0], x: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
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
        whileHover={{ scale: 1.02, rotate: 0.5 }}
        className="relative will-change-transform"
      >
        {/* Glow ring */}
        <div className="absolute -inset-6 rounded-[3.25rem] bg-gradient-to-br from-primary/25 via-secondary/12 to-accent/18 blur-2xl" />
        
        <div className="relative w-60 h-60 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-[2.75rem] gradient-card shadow-warm border border-border/40 flex items-center justify-center p-6 backdrop-blur-sm">
          <img
            src={logo}
            alt="กรุ้งกริ้ง ทอดกรอบ"
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
        className="text-center mt-6 space-y-2"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
          กรุ้งกริ้ง{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            ทอดกรอบ
          </span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground font-normal max-w-md mx-auto leading-relaxed">
          อาหารสด • แปรรูป | อร่อยทุกคำ สดใหม่ทุกวัน
        </p>
      </motion.div>

      <motion.a
        href="#products"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="mt-7 gradient-warm text-primary-foreground px-8 py-3 rounded-2xl font-semibold text-base shadow-warm cursor-pointer flex items-center gap-2"
      >
        ดูสินค้าทั้งหมด
        <ChevronDown className="w-5 h-5" />
      </motion.a>
    </section>
  );
};

export default Hero;
