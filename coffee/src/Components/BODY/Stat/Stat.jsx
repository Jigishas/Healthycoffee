import React from 'react';
import { Activity, Users, Sprout, Coffee, TrendingUp } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Stat = () => {
  const stats = [
    {
      icon: Activity,
      value: "5K+",
      label: "Diseases Solved",
      color: "text-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100",
      borderColor: "border-emerald-200",
      hoverColor: "hover:border-emerald-400"
    },
    {
      icon: Users,
      value: "10K+",
      label: "Farmers Helped",
      color: "text-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      hoverColor: "hover:border-blue-400"
    },
    {
      icon: Sprout,
      value: "15K+",
      label: "Coffee Planted",
      color: "text-green-600",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      hoverColor: "hover:border-green-400"
    },
    {
      icon: Coffee,
      value: "20K+",
      label: "Cups of Coffee",
      color: "text-amber-600",
      bgColor: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      hoverColor: "hover:border-amber-400"
    }
  ];

  return (
    <motion.div
      className="flex justify-center items-center gap-6 md:gap-8 py-16 md:py-24 px-4 md:px-8 bg-white relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-16 h-16 border-2 border-amber-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-12 h-12 border-2 border-emerald-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 border-2 border-orange-400 rounded-full"></div>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 max-w-7xl w-full">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`text-center bg-gradient-to-br ${stat.bgColor} border-2 ${stat.borderColor} rounded-3xl p-6 md:p-8 w-64 md:w-72 min-h-56 md:min-h-64 shadow-xl transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl ${stat.hoverColor} relative overflow-hidden group cursor-pointer`}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Animated Top Border */}
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-emerald-500"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
            />

            {/* Icon with Animation */}
            <motion.div
              className="flex justify-center mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
            >
              <stat.icon className={`w-12 h-12 md:w-16 md:h-16 ${stat.color}`} />
            </motion.div>

            {/* Value with Counter Animation */}
            <motion.h2
              className={`text-3xl md:text-4xl mb-3 font-bold ${stat.color}`}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              viewport={{ once: true }}
            >
              {stat.value}
            </motion.h2>

            {/* Label */}
            <motion.p
              className={`font-semibold text-base md:text-lg ${stat.color.replace('600', '700')}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              viewport={{ once: true }}
            >
              {stat.label}
            </motion.p>

            {/* Hover Effect Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
              initial={false}
            />

            {/* Floating Particles */}
            <motion.div
              className="absolute top-4 right-4 w-2 h-2 bg-amber-400 rounded-full opacity-60"
              animate={{
                y: [0, -10, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.3
              }}
            />
            <motion.div
              className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-40"
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.4 + 1
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Trending Up Indicator */}
      <motion.div
        className="absolute bottom-8 right-8 text-amber-600"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        viewport={{ once: true }}
        animate={{ y: [0, -5, 0] }}
      >
        <TrendingUp className="w-8 h-8" />
      </motion.div>
    </motion.div>
  );
};

export default Stat;
