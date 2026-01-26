import React, { useState } from 'react';
import { Activity, Users, Sprout, Coffee, TrendingUp, Shield, BarChart, Target, Leaf, TreePine } from 'lucide-react';

const AnimatedCounter = ({ to, suffix = '' }) => {
  const formattedCount = to >= 1000 ? `${(to / 1000).toFixed(1)}K+` : to;
  return <span>{formattedCount}{suffix}</span>;
};

const COLOR_CONFIG = {
  emerald: { bg: "from-emerald-50 to-emerald-100", border: "border-emerald-200", text: "text-emerald-700", accent: "text-emerald-600" },
  amber: { bg: "from-amber-50 to-amber-100", border: "border-amber-200", text: "text-amber-700", accent: "text-amber-600" },
  blue: { bg: "from-blue-50 to-blue-100", border: "border-blue-200", text: "text-blue-700", accent: "text-blue-600" },
  green: { bg: "from-green-50 to-green-100", border: "border-green-200", text: "text-green-700", accent: "text-green-600" },
  purple: { bg: "from-purple-50 to-purple-100", border: "border-purple-200", text: "text-purple-700", accent: "text-purple-600" },
  teal: { bg: "from-teal-50 to-teal-100", border: "border-teal-200", text: "text-teal-700", accent: "text-teal-600" }
};

const STATS = [
  { icon: Sprout, value: 700, suffix: 'K+', label: "Active Coffee Farmers", description: "Registered farmers across East Africa", color: "emerald", details: ["Kenya: 300K+ farmers", "Ethiopia: 250K+ farmers", "Tanzania: 150K+ farmers"], growth: "+5.2% this year" },
  { icon: Coffee, value: 850, suffix: 'K', label: "Tonnes Produced", description: "Total coffee production annually", color: "amber", details: ["Arabica: 600K tonnes", "Robusta: 250K tonnes", "Export quality: 85%"], growth: "+3.8% annual increase" },
  { icon: Shield, value: 95, suffix: '%', label: "Disease Prevention", description: "Effective treatment and prevention", color: "blue", details: ["Coffee Berry Disease: 92%", "Leaf Rust: 96% success", "Wilt Disease: 97% success"], growth: "Improved by 15% in 3 years" },
  { icon: TrendingUp, value: 40, suffix: '%', label: "Income Increase", description: "Average farmer income growth", color: "green", details: ["Premium Arabica: +45%", "Organic farming: +55%", "Direct trade: +60%"], growth: "Sustainable growth" },
  { icon: Users, value: 200, suffix: 'K+', label: "Cooperative Members", description: "Farmers in cooperatives", color: "purple", details: ["Better pricing through unity", "Collective bargaining power", "Shared resources"], growth: "+12K new members" },
  { icon: Activity, value: 98, suffix: '%', label: "Crop Survival Rate", description: "Healthy plant maintenance", color: "teal", details: ["Proper pruning: 99% success", "Optimal spacing: 97% success", "Soil management: 96% success"], growth: "Consistently above 95%" }
];

const Stat = () => {
  const [activeStat, setActiveStat] = useState(null);
  const [touchActive, setTouchActive] = useState(null);
  const handleTouchStart = (index) => { setTouchActive(index); setActiveStat(index); };
  const handleTouchEnd = () => { setTimeout(() => { setTouchActive(null); setActiveStat(null); }, 300); };

  return (
    <div className="py-8 sm:py-10 md:py-16 px-1 sm:px-2 md:px-4 bg-gradient-to-br from-emerald-50 via-amber-50 to-blue-50 relative overflow-hidden flex justify-center items-center flex-col">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 sm:-top-20 -left-12 sm:-left-20 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-12 sm:-bottom-20 -right-12 sm:-right-20 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-10">
          {[...Array(12)].map((_, i) => (<div key={i} className="absolute w-2 h-2 bg-emerald-400 rounded-full" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-1 sm:px-2 flex flex-col items-center">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl">
              <BarChart className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h5 className="font-bold text-emerald-700 whitespace-nowrap text-sm sm:text-base md:text-xl">Coffee Farming Statistics</h5>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 leading-tight px-1 sm:px-0">East Africa's Coffee <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">By The Numbers</span></h2>
          <h6 className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mx-auto max-w-full leading-relaxed px-1 sm:px-0">Real data showing growth, success, and opportunities in coffee farming</h6>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10 justify-center">
          {STATS.map((stat, index) => {
            const colors = COLOR_CONFIG[stat.color];
            return (
              <div key={index} className="w-full">
                <div>
                  <div className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-full transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group touch-pan-y`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500" />
                    <div className="p-0">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 ${colors.text}`}>
                          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"><stat.icon className="w-full h-full" /></div>
                        </div>
                        <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-white/90 rounded-full">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                          <span className="text-xs sm:text-sm font-semibold text-green-600 whitespace-nowrap">{stat.growth}</span>
                        </div>
                      </div>
                      <div className="mb-2 sm:mb-3">
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <h2 className={`font-black ${colors.accent} text-2xl sm:text-3xl md:text-4xl leading-none`}><AnimatedCounter to={stat.value} /></h2>
                          {stat.suffix && <h4 className={`font-bold ${colors.accent} text-lg sm:text-xl md:text-2xl`}>{stat.suffix}</h4>}
                        </div>
                      </div>
                      <h5 className={`font-bold mb-1 sm:mb-2 ${colors.text} text-sm sm:text-base md:text-lg leading-tight`}>{stat.label}</h5>
                      <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">{stat.description}</p>
                      <div className="sm:hidden flex justify-center mb-2">
                        <span className="text-gray-500 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Tap for details</span>
                      </div>
                      <div className="overflow-hidden">
                        <div className="pt-3 sm:pt-4 border-t border-white/50">
                          <p className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Details:</p>
                          <ul className="space-y-1">
                            {stat.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${colors.accent.replace('text', 'bg')}`} />
                                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{detail}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-md group-hover:scale-150 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-12 relative z-10">
          <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {[{ icon: Target, color: 'emerald', title: 'Key Insight', text: 'Farmers in cooperatives earn 30% more' }, { icon: Leaf, color: 'amber', title: 'Sustainable Growth', text: 'Organic farming adoption up by 45%' }, { icon: TreePine, color: 'blue', title: 'Future Projection', text: 'Expected 25% growth in next 5 years' }].map((item, i) => (
                <div key={i} className="w-full">
                  <div className={`flex items-center gap-3 sm:gap-4 ${i > 0 ? 'mb-4 sm:mb-0' : ''}`}>
                    <div className={`p-2 sm:p-3 bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-xl sm:rounded-2xl flex-shrink-0`}>
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h6 className={`font-bold text-${item.color}-800 truncate text-sm sm:text-base`}>{item.title}</h6>
                      <p className="text-gray-600 text-xs sm:text-sm">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center relative z-10">
          <p className="text-gray-600 mb-4 sm:mb-6 mx-auto text-sm sm:text-base max-w-full sm:max-w-4xl leading-relaxed px-1 sm:px-0">These numbers show the incredible potential of coffee farming in East Africa. Join thousands of successful farmers today.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button onClick={() => document.getElementById('camera')?.scrollIntoView({ behavior: 'smooth' })} className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base">Start Your Coffee Farm</button>
            <button onClick={() => window.open('/market-analysis', '_blank')} className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 border-2 border-emerald-600 text-emerald-700 font-semibold rounded-lg sm:rounded-xl hover:bg-emerald-50 transition-all duration-300 text-sm sm:text-base">View Market Analysis</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stat;
