import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Leaf, Heart, Shield, WandSparkles } from 'lucide-react';


const Belowimg = () => {
  return (
    <motion.div
      className="py-16 md:py-24 px-8 bg-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-amber-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-emerald-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 border-2 border-orange-400 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-200/50 p-8 md:p-16"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          {/* Header Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Leaf className="w-12 h-12 text-emerald-500" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-emerald-600 bg-clip-text text-transparent">
                Healthy Coffee
              </h2>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Heart className="w-12 h-12 text-red-500" />
              </motion.div>
            </div>

            {/* Animated Underline */}
            <motion.div
              className="w-32 h-1 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full mx-auto mb-8"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              viewport={{ once: true }}
            />
          </motion.div>

          {/* Content Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-lg md:text-xl lg:text-2xl text-amber-800 leading-relaxed font-medium mb-8 max-w-4xl mx-auto">
              A healthy coffee plant is the foundation of the entire coffee industry. It ensures high yields of quality beans, supports farmer livelihoods, and is more resistant to pests and diseases, which is vital for sustainable production. AI is needed in this field to improve the Quality and yield of our Products. 
            </p>

            {/* Feature Icons */}
            <motion.div
              className="flex flex-wrap justify-center items-center gap-8 mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              viewport={{ once: true }}
            >
              {[
                { icon: Leaf, label: "Quality Beans", color: "text-emerald-600" },
                { icon: Heart, label: "Farmer Support", color: "text-red-500" },
                { icon: Shield, label: "Disease Resistant", color: "text-blue-600" },
                { icon: WandSparkles, label: "AI Driven Growth", color: "text-purple-600" }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-amber-200/50"
                  whileHover={{ scale: 1.1, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                  >
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </motion.div>
                  <span className="text-sm font-semibold text-amber-700 text-center">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 right-10 w-4 h-4 bg-amber-400 rounded-full opacity-60"
        animate={{
          y: [0, -20, 0],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-32 left-16 w-6 h-6 bg-emerald-400 rounded-full opacity-40"
        animate={{
          y: [0, -25, 0],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </motion.div>
  );
};

export default Belowimg;
