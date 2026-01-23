import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Coffee, Leaf, TrendingUp } from 'lucide-react';

const faqs = [
  {
    question: "Where does coffee originate?",
    answer: "Coffee originated in Ethiopia and spread to the Arabian Peninsula, eventually becoming a global beverage."
  },
  {
    question: "What is the difference between Arabica and Robusta beans?",
    answer: "Arabica beans are smoother and have higher acidity, while Robusta beans are stronger, more bitter, and contain more caffeine."
  },
  {
    question: "How should coffee beans be stored?",
    answer: "Store coffee beans in an airtight container, away from light, heat, and moisture to preserve freshness."
  },
  {
    question: "Is coffee good for health?",
    answer: "Moderate coffee consumption is linked to several health benefits, including improved alertness and antioxidants, but excessive intake may cause side effects."
  }
];

const AboutCoffee = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div id="about-coffee" className="w-full bg-gradient-to-b from-amber-50 to-white py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Coffee className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              About Coffee
            </h1>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* What is Coffee Section */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-md border border-amber-100 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Coffee className="w-6 h-6 text-amber-600" />
              What is Coffee?
            </h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Coffee is a brewed beverage prepared from roasted coffee beans, the seeds of berries from certain Coffea species. It is enjoyed worldwide for its rich flavor, energizing effect, and cultural significance.
            </p>
          </motion.section>

          {/* Types of Coffee Beans */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-md border border-amber-100 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-4 sm:mb-5 flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-600" />
              Types of Coffee Beans
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-400">
                <div className="font-semibold text-amber-900 mb-1">Arabica</div>
                <div className="text-sm text-gray-700">Smooth, mild flavor, higher acidity.</div>
              </div>
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-orange-400">
                <div className="font-semibold text-amber-900 mb-1">Robusta</div>
                <div className="text-sm text-gray-700">Strong, bold taste, higher caffeine.</div>
              </div>
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-300">
                <div className="font-semibold text-amber-900 mb-1">Liberica</div>
                <div className="text-sm text-gray-700">Unique floral aroma, rare variety.</div>
              </div>
            </div>
          </motion.section>

          {/* Health Benefits */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-md border border-amber-100 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-4 sm:mb-5 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Health Benefits
            </h2>
            <ul className="space-y-2 sm:space-y-3">
              {[
                'Rich in antioxidants',
                'May improve energy and focus',
                'Linked to lower risk of certain diseases',
                'Supports cardiovascular health',
                'Contains essential nutrients'
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                  <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Coffee Culture */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg text-white"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Coffee Culture</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Coffee is more than a drink—it's a global culture. From Italian espresso bars to Ethiopian coffee ceremonies, coffee brings people together and inspires creativity. Every cup tells a story of tradition, innovation, and human connection across continents.
            </p>
          </motion.section>

          {/* FAQ Section */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-md border border-amber-100"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-4 sm:mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="border border-amber-100 rounded-lg overflow-hidden"
                  initial={false}
                >
                  <motion.button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors flex items-center justify-between gap-3 touch-target"
                  >
                    <span className="font-semibold text-amber-900 text-sm sm:text-base pr-2">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-amber-600" />
                    </motion.div>
                  </motion.button>
                  
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedFaq === idx ? 'auto' : 0,
                      opacity: expandedFaq === idx ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 bg-white text-gray-700 text-sm sm:text-base leading-relaxed border-t border-amber-100">
                      {faq.answer}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default AboutCoffee;