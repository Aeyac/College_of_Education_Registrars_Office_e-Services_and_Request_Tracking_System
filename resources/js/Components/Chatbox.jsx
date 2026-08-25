import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function Chatbox() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm the CED Registrar Assistant. Ask me anything about document requests, faculty schedules, or our policies.", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('/chat/ask', { message: userMessage.text });
            setMessages((prev) => [...prev, { text: response.data.reply, sender: 'ai' }]);
        } catch (error) {
            setMessages((prev) => [...prev, { text: "Sorry, I'm having trouble connecting to the server.", sender: 'ai' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200]">
            {isOpen ? (
                <div className="w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl flex flex-col h-[450px] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 font-black text-xs">
                                AI
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">CED Assistant</h3>
                                <p className="text-[10px] text-slate-300">Online 24/7</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-yellow-400 text-slate-900 rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                                    <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-sm shadow-sm text-xs flex gap-1 items-center h-10">
                                    <span className="animate-bounce inline-block w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                    <span className="animate-bounce delay-75 inline-block w-1.5 h-1.5 bg-slate-400 rounded-full mx-1"></span>
                                    <span className="animate-bounce delay-150 inline-block w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white shrink-0 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                        />
                        <button type="submit" disabled={!input.trim()} className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0">
                            <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 hover:scale-105 transition-all ring-4 ring-white"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </button>
            )}
        </div>
    );
}