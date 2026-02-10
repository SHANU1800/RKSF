import { useState, useRef } from 'react';
import { API_BASE_URL } from './utils/apiConfig';

export default function CustomerCare({ currentUser }) {
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [grievanceMode, setGrievanceMode] = useState(false);
  const [grievanceSubmitted, setGrievanceSubmitted] = useState(false);
  const listRef = useRef(null);

  const submitGrievance = async () => {
    const text = input.trim();
    if (!text) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/support/grievance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: text,
          userId: currentUser?._id,
          userName: currentUser?.username,
          userEmail: currentUser?.email,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit grievance');

      setGrievanceSubmitted(true);
      setInput('');
      setMessages(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: 'Thank you for your grievance. Our support team will review it and get back to you via email within 24-48 hours.' }
      ]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to submit grievance. Please try again.' }]);
    } finally {
      setLoading(false);
      setGrievanceMode(false);
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: text,
          history: messages,
          context: {
            user: { id: currentUser?._id, name: currentUser?.username, role: currentUser?.role },
          }
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI request failed');

      const replyText = data?.reply || 'I am here to help. Could you please share more details?';
      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that right now. Please try again.' }]);
    } finally {
      setLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="glass-panel rounded-2xl border border-white/10 p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-[#00f0ff] font-semibold">Support Center</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white">Customer Care</h3>
            <p className="text-gray-300 text-sm md:text-base">Get instant help from our AI assistant or submit a detailed grievance to our team.</p>
          </div>
          <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Signed in as</p>
            <p className="text-white font-bold text-base">{currentUser?.username}</p>
            <p className="text-xs text-gray-500">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 p-6 md:p-8 flex flex-col shadow-lg relative overflow-hidden" style={{ minHeight: '600px' }}>
          {/* SVG Background */}
          <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
            <circle cx="10%" cy="20%" r="8%" fill="black" />
            <circle cx="90%" cy="80%" r="10%" fill="black" />
            <rect x="70%" y="10%" width="20%" height="15%" fill="black" />
            <polygon points="100,50 150,150 50,150" fill="black" opacity="0.5" />
          </svg>
          
          <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#33f3ff] flex items-center justify-center shadow-lg shadow-[#00f0ff]/20">
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg md:text-xl">RKserve Care</p>
                <p className="text-sm text-gray-400">AI Assistant • Powered by Ollama</p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
              <span className="flex items-center gap-2 text-xs font-semibold text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setGrievanceMode(false)}
              className={`flex-1 py-3.5 px-5 rounded-xl text-base font-bold transition-all duration-200 ${
                !grievanceMode
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] text-black shadow-lg shadow-[#00f0ff]/25 scale-105'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>AI Assistant</span>
              </span>
            </button>
            <button
              onClick={() => setGrievanceMode(true)}
              className={`flex-1 py-3.5 px-5 rounded-xl text-base font-bold transition-all duration-200 ${
                grievanceMode
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Submit Grievance</span>
              </span>
            </button>
          </div>

          <div ref={listRef} className="flex-1 bg-slate-900/70 rounded-2xl border border-white/10 p-5 overflow-y-auto space-y-4 shadow-inner" style={{ minHeight: '350px' }}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#00f0ff]/20 flex items-center justify-center border-2 border-[#00f0ff]/30">
                  {grievanceMode ? (
                    <svg className="w-10 h-10 text-[#00f0ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-[#00f0ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-300 text-base md:text-lg font-medium max-w-md">
                  {grievanceMode
                    ? 'Submit a detailed grievance to our support team. You will receive a response via email within 24-48 hours.'
                    : 'Ask anything about orders, payments, providers, or your account. I\'m here to help!'}
                </p>
                <p className="text-gray-500 text-sm">Start typing to begin...</p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm md:text-base max-w-[85%] md:max-w-[75%] shadow-md ${m.role === 'user' ? 'bg-gradient-to-br from-[#00f0ff] to-[#33f3ff] text-black border border-[#00f0ff]/50' : 'bg-white/10 border border-white/20'}`}>
                    <p className={`font-bold text-xs mb-1.5 ${m.role === 'user' ? 'text-black/70' : 'text-gray-300'}`}>{m.role === 'user' ? currentUser?.username || 'You' : 'RKserve Care'}</p>
                    <p className={`whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'text-black' : 'text-white'}`}>{m.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4 mt-6">
            {grievanceMode && (
              <div className="bg-orange-500/10 border border-orange-400/40 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-orange-300 font-semibold text-sm">Grievance Submission</p>
                  <p className="text-orange-200/80 text-xs mt-1">Describe your issue in detail. Our admin team will review and respond within 24-48 hours.</p>
                </div>
              </div>
            )}
            <div className="flex gap-4 flex-col md:flex-row">
              {grievanceMode ? (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  disabled={loading}
                  rows={4}
                  className="flex-1 px-5 py-4 bg-slate-900/80 text-white text-base rounded-xl border border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:opacity-60 resize-none shadow-inner placeholder-gray-500"
                />
              ) : (
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }}}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 px-5 py-4 bg-slate-900/80 text-white text-base rounded-xl border border-white/20 focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/20 focus:outline-none shadow-inner placeholder-gray-500"
                />
              )}
              <button
                onClick={grievanceMode ? submitGrievance : sendMessage}
                disabled={loading || !input.trim()}
                className={`px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-w-[160px] ${
                  grievanceMode
                    ? 'bg-orange-500 hover:shadow-orange-500/20 text-white'
                    : 'bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:shadow-[#00f0ff]/30 text-black'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Sending...
                  </span>
                ) : grievanceMode ? 'Submit Grievance' : 'Send Message'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-rose-900/40 border border-rose-500/50 text-rose-200 text-sm rounded-xl p-4 flex items-start gap-3 shadow-lg">
              <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-rose-300/90 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[#00f0ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h4 className="text-lg font-bold text-white">Support Guidelines</h4>
          </div>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-[#00f0ff] font-bold mt-0.5">•</span>
              <span>Our AI assistant is empathetic and designed to help you kindly and efficiently.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#00f0ff] font-bold mt-0.5">•</span>
              <span>For sensitive or complex issues, we may suggest contacting a human agent.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#00f0ff] font-bold mt-0.5">•</span>
              <span>We maintain a safe environment and politely decline harmful requests.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#00f0ff] font-bold mt-0.5">•</span>
              <span>Share details like order ID or email for faster, more accurate support.</span>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-xl">
            <div className="flex items-start gap-2 mb-1">
              <svg className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-xs text-[#00f0ff] font-semibold">Pro Tip</p>
            </div>
            <p className="text-xs text-[#00f0ff]/80">Be specific with your questions to get the most helpful responses!</p>
          </div>
        </div>
      </div>
    </div>
  );
}












