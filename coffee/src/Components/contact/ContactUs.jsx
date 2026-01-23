import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Phone, MapPin, CheckCircle } from 'lucide-react';

const ContactUs = () => {
  const [submittedContact, setSubmittedContact] = useState(null);

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Chat with us directly on WhatsApp for quick responses.',
      link: 'https://wa.me/254743121169',
      linkText: 'Message us on WhatsApp',
      color: 'emerald'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'For detailed inquiries, email us.',
      link: 'mailto:jigishaflamings336@gmail.com',
      linkText: 'jigishaflamings336@gmail.com',
      color: 'blue'
    },
    {
      icon: Phone,
      title: 'Phone',
      description: 'Call us during business hours (8 AM - 6 PM EAT)',
      link: 'tel:+254743121169',
      linkText: '+254743121169',
      color: 'amber'
    },
    {
      icon: MapPin,
      title: 'Location',
      description: 'Visit us at our office in Kenya',
      link: '#',
      linkText: 'East Africa',
      color: 'red'
    }
  ];

  const handleContactClick = (index) => {
    setSubmittedContact(index);
    setTimeout(() => setSubmittedContact(null), 2000);
  };

  return (
    <div id="contact" className="w-full bg-gradient-to-b from-white to-amber-50 py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-12 text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have questions about coffee, feedback, or partnership inquiries, reach out to us using any method below.
          </p>
        </motion.div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {contactMethods.map((method, idx) => {
            const Icon = method.icon;
            const colorClasses = {
              emerald: 'from-emerald-500 to-teal-600 text-emerald-50',
              blue: 'from-blue-500 to-indigo-600 text-blue-50',
              amber: 'from-amber-500 to-orange-600 text-amber-50',
              red: 'from-red-500 to-pink-600 text-red-50'
            };

            return (
              <motion.a
                key={idx}
                href={method.link}
                target={method.link.startsWith('http') ? '_blank' : undefined}
                rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={() => handleContactClick(idx)}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="block"
              >
                <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br ${colorClasses[method.color]} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>

                  {/* Content */}
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{method.title}</h2>
                  <p className="text-sm text-gray-600 mb-4 flex-grow">{method.description}</p>

                  {/* Link with checkmark animation */}
                  <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700 group">
                    <span className="text-amber-600 group-hover:text-amber-700 transition-colors">
                      {method.linkText}
                    </span>
                    {submittedContact === idx && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-md border border-amber-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Response Times</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
              <h3 className="font-semibold text-emerald-900 mb-2">WhatsApp & Phone</h3>
              <p className="text-sm text-emerald-700">Response within 1-2 hours during business hours</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Email</h3>
              <p className="text-sm text-blue-700">Response within 24 hours</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">Business Hours</h3>
              <p className="text-sm text-amber-700">Monday - Friday, 8:00 AM - 6:00 PM (EAT)</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">Weekends & Holidays</h3>
              <p className="text-sm text-purple-700">Limited support available</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUs;