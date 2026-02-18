import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const Hero = () => {
  return (
    <section className="gradient-hero min-h-[65vh] flex flex-col items-center justify-center px-4 pt-10 pb-16 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-48 h-48 rounded-full bg-primary/8 blur-[80px]" />
        <div className="absolute bottom-[15%] right-[8%] w-56 h-56 rounded-full bg-secondary/15 blur-[80px]" />
        <div className="absolute top-[40%] right-[15%] w-24 h-24 rounded-full bg-accent/10 blur-[50px]" />
      </div>

      {/* Logo with glow ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Glow behind logo */}
        <div className="absolute inset-0 scale-110 rounded-full bg-primary/15 blur-3xl animate-pulse" />
        
        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] bg-card/80 backdrop-blur-xl shadow-warm border border-border/50 flex items-center justify-center p-4">
          <img
            src={logo}
            alt="กรุ้งกริ้ง ทอดกรอบ"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mt-8 space-y-3"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          กรุ้งกริ้ง <span className="text-primary">ทอดกรอบ</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground font-light max-w-md mx-auto">
          อาหารสด - แปรรูป | อร่อยทุกคำ สดใหม่ทุกวัน
        </p>
      </motion.div>

      <motion.a
        href="#products"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="mt-8 gradient-warm text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-lg shadow-warm cursor-pointer"
      >
        ดูสินค้าทั้งหมด
      </motion.a>
    </section>
  );
};

export default Hero;
