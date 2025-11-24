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
    <div className="flex justify-center items-center gap-6 md:gap-8 py-16 md:py-24 px-4 md:px-8 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-16 h-16 border-2 border-amber-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-12 h-12 border-2 border-emerald-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 border-2 border-orange-400 rounded-full"></div>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 max-w-7xl w-full">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`text-center bg-gradient-to-br ${stat.bgColor} border-2 ${stat.borderColor} rounded-3xl p-6 md:p-8 w-64 md:w-72 min-h-56 md:min-h-64 shadow-xl transition-all duration-300 hover:-translate-y-2 ${stat.hoverColor} relative overflow-hidden group cursor-default`}
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
            <div className="flex justify-center mb-4">
              <stat.icon className={`w-12 h-12 md:w-16 md:h-16 ${stat.color}`} />
            </div>

            {/* Value with Counter Animation */}
            <h2 className={`text-3xl md:text-4xl mb-3 font-bold ${stat.color}`}>{stat.value}</h2>

            {/* Label */}
            <p className={`font-semibold text-base md:text-lg ${stat.color.replace('600', '700')}`}>{stat.label}</p>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 rounded-3xl" />
          </motion.div>
        ))}
      </div>

      {/* Trending Up Indicator */}
      <div className="absolute bottom-8 right-8 text-amber-600">
        <TrendingUp className="w-8 h-8" />
      </div>
    </div>
  );
};

export default Stat;
