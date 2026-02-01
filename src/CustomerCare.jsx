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
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-panel rounded-2xl border border-white/5 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Support</p>
            <h3 className="text-xl md:text-2xl font-bold text-white">Customer Care</h3>
            <p className="text-gray-400 text-xs md:text-sm">Chat with our AI assistant for quick help.</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Signed in as</p>
            <p className="text-white font-semibold text-sm">{currentUser?.username}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-3 md:p-4 flex flex-col min-h-100 md:min-h-120">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-slate-400">AI Assistant</p>
              <p className="text-white font-bold text-sm md:text-lg">RKserve Care</p>
              <p className="text-[10px] md:text-[11px] text-slate-400 truncate">Powered by Ollama – qwen2.5:7b-instruct</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-3 mb-3 flex-wrap">
            <button
              onClick={() => setGrievanceMode(false)}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                !grievanceMode
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              💬 AI Assistant
            </button>
            <button
              onClick={() => setGrievanceMode(true)}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                grievanceMode
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-400/40'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              📝 Submit Grievance
            </button>
          </div>

          <div ref={listRef} className="flex-1 bg-slate-900/60 rounded-xl border border-white/5 p-3 overflow-y-auto space-y-3 -webkit-overflow-scrolling-touch">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                <p className="text-gray-400 text-xs md:text-sm">
                  {grievanceMode
                    ? '📝 Submit a detailed grievance to our support team. You will receive a response via email within 24-48 hours.'
                    : 'Ask anything about orders, payments, providers, or your account. I\'m here to help!'}
                </p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-xl text-xs md:text-sm max-w-[85%] md:max-w-[75%] ${m.role === 'user' ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-white/5 border border-white/10'}`}>
                    <p className="text-gray-200 font-semibold text-xs">{m.role === 'user' ? currentUser?.username || 'You' : 'RKserve Care'}</p>
                    <p className="text-white whitespace-pre-wrap wrap-break-word">{m.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 mt-3">
            {grievanceMode && (
              <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-2 text-xs text-orange-300">
                ⚠️ Free text allowed for grievances. Our admin team will review your message.
              </div>
            )}
            <div className="flex gap-3 flex-col md:flex-row">
              {grievanceMode ? (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  disabled={loading}
                  rows={3}
                  className="flex-1 px-4 py-3 bg-slate-900/70 text-white text-sm rounded-xl border border-white/10 focus:border-orange-400 focus:outline-none disabled:opacity-60 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }}}
                  placeholder="Type your message"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none text-sm"
                />
              )}
              <button
                onClick={grievanceMode ? submitGrievance : sendMessage}
                disabled={loading || !input.trim()}
                className={`px-5 py-3 rounded-xl hover:shadow-lg disabled:opacity-60 text-white text-sm font-semibold transition active:scale-95 md:whitespace-nowrap ${
                  grievanceMode
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-orange-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/25'
                }`}
              >
                {loading ? 'Sending...' : grievanceMode ? 'Submit Grievance' : 'Send'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 bg-rose-900/40 border border-rose-700/40 text-rose-200 text-xs md:text-sm rounded-lg p-3">{error}</div>
          )}
        </div>

        <div className="glass-panel rounded-2xl border border-white/5 p-4 space-y-3">
          <p className="text-xs md:text-sm text-gray-300 font-semibold">Guidelines</p>
          <ul className="list-disc list-inside text-xs text-gray-400 space-y-2">
            <li>The assistant is empathetic and aims to help kindly.</li>
            <li>For sensitive issues, we may suggest contacting a human agent.</li>
            <li>We avoid harmful content. If asked, we will politely decline.</li>
            <li>Share details like order ID or email for faster support.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
