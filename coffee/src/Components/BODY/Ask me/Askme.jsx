import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';

const Askme = () => {
  const faqData = [
    {
      question: "What are the ideal growing conditions for coffee plants?",
      answer: (
        <div>
          <p className="mb-4">Coffee plants thrive in specific conditions often called the "coffee belt" between the Tropics of Cancer and Capricorn. Ideal conditions include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Temperature:</strong> 15-24°C (59-75°F) for Arabica, 24-30°C (75-86°F) for Robusta</li>
            <li><strong>Altitude:</strong> 600-2,000 meters (2,000-6,500 ft) above sea level</li>
            <li><strong>Rainfall:</strong> 1,500-2,500 mm (60-100 in) annually, well-distributed</li>
            <li><strong>Soil:</strong> Volcanic, well-draining, pH 6-6.5, rich in organic matter</li>
            <li><strong>Sunlight:</strong> Filtered sunlight or partial shade (especially for young plants)</li>
          </ul>
        </div>
      )
    },
    {
      question: "How long does it take for a coffee plant to produce beans?",
      answer: <p>It typically takes 3 to 4 years for a newly planted coffee tree to begin bearing fruit. The coffee cherries will initially be green and then turn red when ripe and ready for harvesting. A single coffee tree can produce approximately 2,000 coffee cherries annually, which amounts to about 4,000 beans or roughly one pound of roasted coffee.</p>
    },
    {
      question: "What's the difference between Arabica and Robusta coffee plants?",
      answer: (
        <div>
          <p className="mb-4">Arabica and Robusta are the two main species of coffee plants cultivated for consumption:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Arabica (Coffea arabica):</strong> Accounts for about 60-70% of global production. It has a smoother, more complex flavor with higher acidity. It contains about 1.5% caffeine and grows best at higher altitudes.</li>
            <li><strong>Robusta (Coffea canephora):</strong> Has a stronger, more bitter taste with higher caffeine content (about 2.7%). It's more disease-resistant and easier to cultivate, thriving at lower altitudes with higher yields.</li>
          </ul>
        </div>
      )
    },
    {
      question: "How are coffee beans harvested and processed?",
      answer: (
        <div>
          <p className="mb-4">There are two primary methods for harvesting coffee:</p>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li><strong>Strip Picking:</strong> All cherries are stripped off the branch at once, either by machine or by hand.</li>
            <li><strong>Selective Picking:</strong> Only the ripe cherries are harvested individually by hand, with multiple passes done every 8-10 days.</li>
          </ol>
          <p className="mb-4">After harvesting, coffee beans are processed using either:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Dry Method:</strong> Cherries are spread out in the sun to dry for 2-3 weeks</li>
            <li><strong>Wet Method:</strong> Pulp is removed from the cherry before the beans are dried</li>
          </ul>
        </div>
      )
    },
    {
      question: "What are the main challenges in coffee farming?",
      answer: (
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Climate Change:</strong> Rising temperatures and unpredictable rainfall patterns affect yield and quality</li>
          <li><strong>Pests and Diseases:</strong> Coffee leaf rust, berry borer beetles, and other pathogens can devastate crops</li>
          <li><strong>Price Volatility:</strong> Global coffee prices fluctuate significantly, affecting farmer income</li>
          <li><strong>Labor Intensive:</strong> Coffee harvesting requires substantial manual labor</li>
          <li><strong>Water Management:</strong> Traditional processing methods can consume large amounts of water</li>
        </ul>
      )
    },
    {
      question: "What is shade-grown coffee and why is it important?",
      answer: (
        <div>
          <p className="mb-4">Shade-grown coffee is cultivated under a canopy of trees, which provides several benefits:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Biodiversity:</strong> Provides habitat for birds and other wildlife</li>
            <li><strong>Soil Health:</strong> Trees help prevent soil erosion and maintain fertility</li>
            <li><strong>Natural Pest Control:</strong> Birds and insects in the canopy help control pests</li>
            <li><strong>Microclimate:</strong> Trees provide wind protection and temperature regulation</li>
            <li><strong>Quality:</strong> Slower berry maturation often results in more complex flavors</li>
          </ul>
          <p>While shade-grown coffee typically has lower yields than sun-grown varieties, it's generally more sustainable and environmentally friendly.</p>
        </div>
      )
    },
    {
      question: "How does altitude affect coffee flavor?",
      answer: (
        <div>
          <p className="mb-4">Altitude significantly impacts coffee quality and flavor profile:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>High Altitude (1,200m+):</strong> Slower bean maturation develops more complex sugars, resulting in better acidity, aroma, and flavor. Beans are typically denser and harder.</li>
            <li><strong>Medium Altitude (600-1,200m):</strong> Balance between yield and quality, often with good body and mild acidity.</li>
            <li><strong>Low Altitude (0-600m):</strong> Faster maturation produces softer, less complex beans often with more bitter notes.</li>
          </ul>
          <p>The temperature decrease at higher elevations (approximately 1°C per 165m altitude gain) slows the growth cycle, allowing more time for flavor development.</p>
        </div>
      )
    },
    {
      question: "What is the coffee cherry and how is it structured?",
      answer: (
        <div>
          <p className="mb-4">The coffee cherry is the fruit of the coffee plant, and it has several layers:</p>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li><strong>Outer Skin:</strong> Thin red or yellow skin (exocarp)</li>
            <li><strong>Pulp:</strong> Sweet, fruity flesh (mesocarp)</li>
            <li><strong>Pectin Layer:</strong> Mucilaginous layer rich in sugars</li>
            <li><strong>Parchment:</strong> Protective hull around the bean (endocarp)</li>
            <li><strong>Silver Skin:</strong> Thin membrane covering the bean</li>
            <li><strong>Bean:</strong> Actually the seed of the fruit - usually two per cherry</li>
          </ol>
          <p>Processing coffee involves removing these outer layers to get to the green coffee beans inside.</p>
        </div>
      )
    }
  ];

  const coffeeTypes = [
    { name: "Arabica", desc: "Smooth, complex flavor\nHigher acidity\n1.5% caffeine\nGrows at higher altitudes" },
    { name: "Robusta", desc: "Strong, bold flavor\nHigher caffeine (2.7%)\nDisease resistant\nGrows at lower altitudes" },
    { name: "Liberica", desc: "Unique floral aroma\nWoody, smoky flavor\nHeat tolerant\nRare variety" }
  ];

  return (
    <motion.div
      className="max-w-4xl mx-auto my-16 p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-2xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.header
        className="bg-gradient-to-r from-amber-600 to-orange-500 text-white text-center py-12 px-6 rounded-xl shadow-lg mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.h1
          className="text-4xl font-bold mb-2 text-shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Coffee Plantation FAQs
        </motion.h1>
        <motion.p
          className="text-lg opacity-90"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Everything you need to know about coffee cultivation
        </motion.p>
      </motion.header>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <motion.h2
          className="text-3xl font-semibold text-amber-800 mb-8 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          Frequently Asked Questions
        </motion.h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
            >
              <AccordionItem value={`item-${index}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-0">
                <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 transition-all duration-300 text-left">
                  <span className="text-lg font-semibold text-amber-800">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 bg-white text-gray-700 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          {coffeeTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.2 + index * 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-all duration-300 border-amber-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-amber-800">{type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-center whitespace-pre-line">{type.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Askme;
