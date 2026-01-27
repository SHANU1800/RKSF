import { useState, useRef } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function CustomerCare({ currentUser }) {
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

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
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl border border-white/5 p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Support</p>
            <h3 className="text-2xl font-bold text-white">Customer Care</h3>
            <p className="text-gray-400 text-sm">Chat with our empathetic AI assistant for quick help.</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Signed in as</p>
            <p className="text-white font-semibold">{currentUser?.username}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-4 flex flex-col min-h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">AI Assistant</p>
              <p className="text-white font-bold text-lg">RKserve Care</p>
              <p className="text-[11px] text-slate-400">Powered by Ollama – qwen2.5:7b-instruct</p>
            </div>
          </div>

          <div ref={listRef} className="flex-1 bg-slate-900/60 rounded-xl border border-white/5 p-3 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Ask anything about orders, payments, providers, or your account. I\'m here to help ❤️
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-[75%] ${m.role === 'user' ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-white/5 border border-white/10'}`}>
                    <p className="text-gray-200 font-semibold">{m.role === 'user' ? currentUser?.username || 'You' : 'RKserve Care'}</p>
                    <p className="text-white whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }}}
              placeholder="Type your message"
              className="flex-1 px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold disabled:opacity-60"
            >
              {loading ? 'Thinking…' : 'Send'}
            </button>
          </div>

          {error && (
            <div className="mt-3 bg-rose-900/40 border border-rose-700/40 text-rose-200 text-sm rounded-lg p-3">{error}</div>
          )}
        </div>

        <div className="glass-panel rounded-2xl border border-white/5 p-4 space-y-3">
          <p className="text-sm text-gray-300">Guidelines</p>
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
