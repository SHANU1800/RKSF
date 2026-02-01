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
            <p className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold">Support Center</p>
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
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 p-6 md:p-8 flex flex-col shadow-lg" style={{ minHeight: '600px' }}>
          <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
                🤖
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
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                💬 <span>AI Assistant</span>
              </span>
            </button>
            <button
              onClick={() => setGrievanceMode(true)}
              className={`flex-1 py-3.5 px-5 rounded-xl text-base font-bold transition-all duration-200 ${
                grievanceMode
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25 scale-105'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                📝 <span>Submit Grievance</span>
              </span>
            </button>
          </div>

          <div ref={listRef} className="flex-1 bg-gradient-to-br from-slate-900/80 to-slate-900/60 rounded-2xl border border-white/10 p-5 overflow-y-auto space-y-4 shadow-inner" style={{ minHeight: '350px' }}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center text-4xl border border-blue-500/30">
                  {grievanceMode ? '📝' : '💬'}
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
                  <div className={`px-4 py-3 rounded-2xl text-sm md:text-base max-w-[85%] md:max-w-[75%] shadow-md ${m.role === 'user' ? 'bg-gradient-to-br from-emerald-500/30 to-green-600/30 border border-emerald-400/50' : 'bg-white/10 border border-white/20'}`}>
                    <p className="text-gray-300 font-bold text-xs mb-1.5">{m.role === 'user' ? currentUser?.username || 'You' : 'RKserve Care'}</p>
                    <p className="text-white whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4 mt-6">
            {grievanceMode && (
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/40 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
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
                  className="flex-1 px-5 py-4 bg-slate-900/80 text-white text-base rounded-xl border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none shadow-inner placeholder-gray-500"
                />
              )}
              <button
                onClick={grievanceMode ? submitGrievance : sendMessage}
                disabled={loading || !input.trim()}
                className={`px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-w-[160px] ${
                  grievanceMode
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-orange-500/30 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/30 text-white'
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
            <div className="mt-4 bg-gradient-to-r from-rose-900/40 to-red-900/40 border border-rose-500/50 text-rose-200 text-sm rounded-xl p-4 flex items-start gap-3 shadow-lg">
              <span className="text-xl">❌</span>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-rose-300/90 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h4 className="text-lg font-bold text-white">Support Guidelines</h4>
          </div>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-0.5">•</span>
              <span>Our AI assistant is empathetic and designed to help you kindly and efficiently.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-0.5">•</span>
              <span>For sensitive or complex issues, we may suggest contacting a human agent.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-0.5">•</span>
              <span>We maintain a safe environment and politely decline harmful requests.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-0.5">•</span>
              <span>Share details like order ID or email for faster, more accurate support.</span>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-xs text-blue-300 font-semibold mb-1">💡 Pro Tip</p>
            <p className="text-xs text-blue-200/80">Be specific with your questions to get the most helpful responses!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
