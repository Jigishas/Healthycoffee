import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Shield, WandSparkles, Sprout, Coffee, TrendingUp, Target, BarChart, Users, Zap, CheckCircle, Droplets, Thermometer, Sun, Clock } from 'lucide-react';

const BENEFITS = [
  { icon: Sprout, title: "Higher Yield Potential", description: "Healthy plants produce 30-50% more cherries", stats: "40% Increase", color: "#10b981", bgColor: "#ecfdf5", details: ["Better nutrient absorption", "Stronger root systems", "Optimal photosynthesis"] },
  { icon: Coffee, title: "Premium Quality Beans", description: "Improved bean density and flavor complexity", stats: "Grade AA Quality", color: "#f59e0b", bgColor: "#fffbeb", details: ["Higher cupping scores", "Better market price", "Export grade quality"] },
  { icon: Shield, title: "Disease Resistance", description: "Natural immunity against common pathogens", stats: "95% Prevention", color: "#3b82f6", bgColor: "#eff6ff", details: ["Leaf rust resistance", "Berry disease immunity", "Root rot prevention"] },
  { icon: TrendingUp, title: "Sustainable Income", description: "Stable yields ensure consistent farmer revenue", stats: "25% More Profit", color: "#22c55e", bgColor: "#f0fdf4", details: ["Reduced input costs", "Higher market value", "Long-term sustainability"] }
];

const AI_IMPACT = [
  { icon: WandSparkles, title: "Predictive Analysis", description: "AI forecasts disease outbreaks 2 weeks in advance", improvement: "90% Accuracy" },
  { icon: Target, title: "Precision Farming", description: "Optimal fertilizer and water recommendations", improvement: "40% Resource Saving" },
  { icon: BarChart, title: "Yield Optimization", description: "Data-driven pruning and harvesting schedules", improvement: "35% Yield Increase" },
  { icon: Zap, title: "Real-time Monitoring", description: "24/7 plant health tracking and alerts", improvement: "60% Faster Response" }
];

const GROWING_CONDITIONS = [
  { icon: Thermometer, label: "Temperature", value: "15-24°C", ideal: "Optimal for Arabica" },
  { icon: Droplets, label: "Rainfall", value: "1500-2500mm", ideal: "Well distributed" },
  { icon: Sun, label: "Sunlight", value: "Partial Shade", ideal: "4-6 hours daily" },
  { icon: Clock, label: "Maturation", value: "3-4 Years", ideal: "First harvest" }
];

const Belowimg = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 600);
      setIsTablet(width < 900);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{
      padding: isMobile ? '24px 8px' : isTablet ? '32px 12px' : '48px 16px',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #fffbeb 50%, #f0f9ff 100%)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh'
    }}>
      {/* Background Elements */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          top: isMobile ? '-40px' : '-32px',
          left: isMobile ? '-40px' : '-32px',
          width: isMobile ? '80px' : isTablet ? '120px' : '160px',
          height: isMobile ? '80px' : isTablet ? '120px' : '160px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '-40px' : '-32px',
          right: isMobile ? '-40px' : '-32px',
          width: isMobile ? '80px' : isTablet ? '120px' : '160px',
          height: isMobile ? '80px' : isTablet ? '120px' : '160px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />

        {/* Coffee Leaf Pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }}>
          {[...Array(isMobile ? 8 : isTablet ? 12 : 15)].map((_, i) => (
            <Leaf key={i} style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * (isMobile ? 20 : 30) + (isMobile ? 10 : 20)}px`,
              height: `${Math.random() * (isMobile ? 20 : 30) + (isMobile ? 10 : 20)}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
              opacity: Math.random() * 0.3 + 0.1,
              color: '#10b981'
            }} />
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-50px" }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              marginBottom: '16px',
              padding: isMobile ? '8px' : '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: isMobile ? '16px' : '20px',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
            }}>
              <Leaf style={{ color: 'white', width: isMobile ? '24px' : '32px', height: isMobile ? '24px' : '32px' }} />
              <h6 style={{ fontWeight: 700, color: 'white', fontSize: isMobile ? '0.875rem' : '1rem', margin: 0 }}>Coffee Plant Health</h6>
            </div>
            <h1 style={{
              fontSize: isMobile ? '1.5rem' : isTablet ? '2rem' : '3rem',
              fontWeight: 800,
              marginBottom: '8px',
              color: '#111827',
              lineHeight: 1.2
            }}>
              Quality <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Coffee Starts Here</span>
            </h1>
            <p style={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              color: '#6b7280',
              maxWidth: '800px',
              margin: '0 auto 16px',
              fontWeight: 400,
              lineHeight: 1.5
            }}>Healthy plants = premium beans & sustainable yields</p>
          </div>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
            borderRadius: isMobile ? '20px' : '32px',
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            overflow: 'hidden'
          }}>
            {/* Card Header */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: isMobile ? '12px' : '16px'
            }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: isMobile ? 'none' : '1' }}>
                  <h2 style={{
                    fontSize: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
                    fontWeight: 700,
                    color: 'white',
                    marginBottom: '8px',
                    lineHeight: 1.2
                  }}>
                    Plant Health Matters
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    Healthy plants ensure high yields, quality beans & disease resistance
                  </p>
                </div>
                <div style={{ flex: isMobile ? 'none' : '0 0 auto' }}>
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Heart style={{ color: '#ef4444', width: isMobile ? '40px' : '60px', height: isMobile ? '40px' : '60px' }} />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div style={{ padding: isMobile ? '20px 16px' : '32px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)', gap: isMobile ? '16px' : '24px' }}>
                {BENEFITS.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <div style={{
                      background: benefit.bgColor,
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px' : '20px',
                      border: `1px solid ${benefit.color}20`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <benefit.icon style={{ color: benefit.color, flexShrink: 0, width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px', marginTop: '4px' }} />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                            {benefit.title}
                          </h3>
                          <p style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#6b7280', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                            {benefit.description}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {benefit.details.map((detail, i) => (
                              <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.7)', color: benefit.color, padding: '4px 8px', borderRadius: '12px', fontWeight: 500 }}>
                                {detail}
                              </span>
                            ))}
                          </div>
                          <div style={{ marginTop: '12px', fontSize: isMobile ? '0.85rem' : '0.95rem', fontWeight: 700, color: benefit.color }}>
                            {benefit.stats}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Impact Section */}
            <div style={{ padding: isMobile ? '20px 16px' : '32px 24px', background: 'rgba(16, 185, 129, 0.02)', borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
                AI-Powered Benefits
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '16px' }}>
                {AI_IMPACT.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <div style={{
                      background: 'white',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '12px' : '16px',
                      textAlign: 'center',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                      <item.icon style={{ color: '#10b981', width: isMobile ? '24px' : '32px', height: isMobile ? '24px' : '32px', margin: '0 auto 8px' }} />
                      <h4 style={{ fontSize: isMobile ? '0.85rem' : '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', color: '#6b7280', margin: '0 0 8px 0' }}>
                        {item.description}
                      </p>
                      <div style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: 700, color: '#10b981' }}>
                        {item.improvement}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Growing Conditions Section */}
            <div style={{ padding: isMobile ? '20px 16px' : '32px 24px' }}>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
                Optimal Growing Conditions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '16px' }}>
                {GROWING_CONDITIONS.map((condition, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(245, 158, 11, 0.05))',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px' : '20px',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      textAlign: 'center'
                    }}>
                      <condition.icon style={{ color: '#10b981', width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', margin: '0 auto 12px' }} />
                      <p style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', color: '#6b7280', margin: '0 0 4px 0' }}>
                        {condition.label}
                      </p>
                      <p style={{ fontSize: isMobile ? '1rem' : '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
                        {condition.value}
                      </p>
                      <p style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', color: '#10b981', fontWeight: 500, margin: 0 }}>
                        {condition.ideal}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Belowimg;
