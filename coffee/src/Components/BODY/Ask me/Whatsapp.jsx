import React, { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '254743121169';

const Whatsapp = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setStatus('Message saved. Click "Chat on WhatsApp" to send.');
      setIsSaving(false);
      setTimeout(() => setStatus(''), 4000);
    }, 600);
  };

  const handleWhatsAppClick = () => {
    const text = message?.trim() || "Hello! I'm interested in a healthy Coffee.";
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-xl border border-gray-200 text-sm overflow-hidden relative" id="askme">
      {/* Decorative Background Elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gray-100 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-gray-800 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.248-6.189-3.515-8.452"/>
            </svg>
            </div>
            </div>
            <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Get In Touch
            </h2>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mt-2">Have questions about coffee plants? We're here to help!</p>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400 rounded-lg animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-blue-900 font-medium">💡 Tip: Be specific about your question for faster assistance</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
            <label className="block text-sm font-semibold text-gray-800">Your Message</label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question or message here..."
                rows="4"
                className="relative w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-800 focus:ring-2 focus:ring-gray-200 transition-all duration-300 resize-none placeholder-gray-400 text-sm leading-snug shadow-sm hover:border-gray-400 hover:shadow-md"
                maxLength={500}
              />
              <div className={`absolute bottom-3 right-3 text-xs font-medium px-2 py-1 rounded-lg transition-all duration-200 ${
                message.length > 450 ? 'bg-red-50 text-red-700 animate-pulse' : 
                message.length > 400 ? 'bg-yellow-50 text-yellow-700' : 
                'bg-gray-100 text-gray-500'
              }`}>
                {message.length}/500
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span>{500 - message.length} characters remaining</span>
              {message.length > 0 && (
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              )}
            </p>
          </div>

          {/* Quick Message Suggestions */}
          <div className="pt-2 pb-4 border-t border-gray-200 animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
            <p className="text-xs font-semibold text-gray-700 mb-3">Quick suggestions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['Disease identification', 'Nutrient deficiency', 'Watering tips', 'Pest control'].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(suggestion)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 hover:shadow-md border border-gray-200 hover:border-gray-300 transform hover:scale-105"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <button
            type="submit"
            disabled={isSaving}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:from-gray-700 hover:to-gray-800 active:shadow-inner active:from-gray-900 active:to-gray-950 transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm disabled:opacity-75 disabled:cursor-not-allowed ${isSaving ? 'animate-pulse' : ''}`}
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Message
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 active:shadow-inner active:from-green-700 active:to-green-800 transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.248-6.189-3.515-8.452"/>
            </svg>
            <span className="relative z-10">Chat on WhatsApp</span>
          </button>
        </div>
      </form>

      {/* Status Message */}
      {status && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 text-green-800 rounded-xl text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <div className="relative">
              <svg className="w-5 h-5 text-green-600 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span>{status}</span>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center animate-in fade-in duration-500 delay-500">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
          </svg>
          Typical response time: Within 1 hour.
        </p>
      </div>
      </div>
    </div>
  );
};

export default Whatsapp;