import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const Hero = () => {
  return (
    <section className="gradient-hero min-h-[60vh] flex flex-col items-center justify-center px-4 pt-8 pb-12 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-secondary/20 blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="animate-float"
      >
        <img
          src={logo}
          alt="กรุ้งกริ้ง ทอดกรอบ"
          className="w-56 h-56 md:w-72 md:h-72 object-contain drop-shadow-2xl"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center mt-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
          กรุ้งกริ้ง <span className="text-primary">ทอดกรอบ</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground font-light">
          อาหารสด - แปรรูป | อร่อยทุกคำ สดใหม่ทุกวัน
        </p>
      </motion.div>
      
      <motion.a
        href="#products"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 gradient-warm text-primary-foreground px-8 py-3 rounded-full font-semibold text-lg shadow-warm hover:scale-105 transition-transform cursor-pointer"
      >
        ดูสินค้าทั้งหมด
      </motion.a>
    </section>
  );
};

export default Hero;
