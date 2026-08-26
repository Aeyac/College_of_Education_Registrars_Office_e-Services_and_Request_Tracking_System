import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function Chatbox() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm the CED Registrar Assistant. Ask me anything about document requests, faculty schedules, courses, or our policies.", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Mga Matalinong Suggested Prompts para sa Users
    const suggestions = [
        "How do I request a document?",
        "Who are the developers?",
        "How long is the processing time?",
        "How to verify alumni account?",
        "What courses do you offer?",
        "How can I schedule an appointment?"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isLoading]);

    const handleSend = async (messageText) => {
        if (!messageText.trim()) return;
        
        const userMessage = { text: messageText, sender: 'user' };
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

    const onSubmitForm = (e) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200]">
            {isOpen ? (
                <div className="w-[90vw] sm:w-96 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl flex flex-col h-[500px] max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    
                    {/* Header */}
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 font-black text-xs shadow-inner">
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

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-yellow-400 text-slate-900 rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
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

                    {/* Suggested Prompts (Horizontal Scrollable) */}
                    <div className="bg-slate-50 pt-2 px-3 pb-1 border-t border-slate-100 flex gap-2 overflow-x-auto custom-scrollbar hide-scrollbar shrink-0">
                        {suggestions.map((sug, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(sug)}
                                className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-full hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 transition-colors shadow-sm"
                            >
                                {sug}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={onSubmitForm} className="p-3 bg-white shrink-0 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-colors"
                        />
                        <button type="submit" disabled={!input.trim() || isLoading} className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-md shrink-0 flex items-center justify-center">
                            <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 hover:scale-105 transition-all ring-4 ring-white relative group"
                >
                    {/* Tooltip bubble on hover */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                        Chat with AI
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white border-t border-r border-slate-100 rotate-45"></div>
                    </div>

                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </button>
            )}
        </div>
    );
}