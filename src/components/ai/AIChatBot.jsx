import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, MinusCircle } from 'lucide-react';
import { aiService } from '../../services/ai.service';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const AIChatBot = () => {
    const { profile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Chào bạn! Tôi là AgriFlow AI. Tôi có thể giúp gì cho bạn về nông sản hoặc quy trình mua hàng hôm nay?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        // Chuyển lịch sử chat sang định dạng Gemini yêu cầu
        const history = messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const result = await aiService.chatWithAI(userMessage, history, profile);

        if (result.success) {
            setMessages(prev => [...prev, { role: 'model', text: result.text }]);
        } else {
            toast.error(result.error);
            setMessages(prev => [...prev, { role: 'model', text: "Xin lỗi, tôi gặp sự cố kỹ thuật. Bạn vui lòng thử lại sau nhé!" }]);
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative border-4 border-white"
                >
                    <div className="absolute -inset-1 bg-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 transition animate-pulse"></div>
                    <Bot size={32} className="relative z-10" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                        <Sparkles size={10} className="text-white fill-white" />
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[380px] sm:w-[420px] h-[600px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-emerald-50 animate-in slide-in-from-bottom-10 duration-500">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                <Bot size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg tracking-tight uppercase italic">AgriFlow AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Đang trực tuyến</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <MinusCircle size={20} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 scrollbar-hide">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-${msg.role === 'user' ? 'right' : 'left'}-5 duration-300`}>
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${msg.role === 'user' ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-emerald-600 text-white border-emerald-500'
                                        }`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-emerald-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-700 border border-emerald-50 rounded-tl-none font-medium'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                                        <Loader2 size={14} className="text-emerald-600 animate-spin" />
                                    </div>
                                    <div className="p-4 bg-white text-gray-400 rounded-3xl rounded-tl-none border border-emerald-50 italic text-xs">
                                        AgriFlow AI đang suy nghĩ...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions - Phân biệt theo Profile */}
                    {!isLoading && (
                        <div className="px-6 py-3 bg-white flex gap-2 overflow-x-auto scrollbar-hide border-t border-emerald-50">
                            {(profile?.role === 'farmer'
                                ? ["📈 Phân tích giá chợ", "📊 Cách tăng doanh số", "📦 Tư vấn hàng hóa"]
                                : ["🍎 Sản phẩm ngon nhất?", "💰 Tìm giá rẻ nhất", "🌿 Nông sản sạch là gì?"]
                            ).map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(prompt);
                                        // Gửi đi ngay lập tức
                                        setTimeout(() => document.getElementById('chat-submit-btn')?.click(), 50);
                                    }}
                                    className="whitespace-nowrap px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full transition-all border border-emerald-100 shadow-sm flex-shrink-0"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-6 bg-white border-t border-emerald-50">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Hỏi tôi bất cứ điều gì về nông sản..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full pl-6 pr-14 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-700 placeholder-gray-400 shadow-inner"
                            />
                            <button
                                id="chat-submit-btn"
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-3 font-bold uppercase tracking-tight opacity-50">
                            Powered by Gemini 1.5 Flash • AgriFlow Support
                        </p>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChatBot;
