import React, { useState, useEffect, useRef } from 'react';
import type { View, AppContextData, ChatMessage } from '../types';
import { getAiAssistantResponse } from '../lib/ai';

interface AiAssistantProps {
    context: AppContextData;
    setView: (view: View) => void;
}

const WolfIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.37C8.91 2.37 6.22 4.1 5 6.48 5.05 8.13 6 9.68 7.32 10.85c-.39.43-.76.9-1.08 1.41C5.22 13.64 4.5 15.72 4.5 18c0 1.25.33 2.5.95 3.65.25.46.16.89-.04 1.15-.19.25-.45.4-.75.4-.2 0-.4-.06-.59-.18C2.12 21.82 1 19.33 1 18c0-2.82 1-5.43 2.82-7.25C5.24 8.87 6.64 7.63 7.5 6c-.5-1.5-1-3.05-.75-4.4C8.42.5 10.36-.18 12 0c1.64-.18 3.58.5 5.25 1.6.25 1.35-.25 2.9-.75 4.4.86 1.63 2.26 2.87 3.68 4.75C22 12.57 23 15.18 23 18c0 1.33-1.12 3.82-3.07 5.02-.19.12-.39.18-.59.18-.3 0-.56-.15-.75-.4-.2-.26-.29-.69-.04-1.15.62-1.15.95-2.4.95-3.65 0-2.28-.72-4.36-1.74-5.74-.32-.51-.69-.98-1.08-1.41C18 9.68 18.95 8.13 19 6.48 17.78 4.1 15.09 2.37 12 2.37zM8.5 12c-.83 0-1.5-.67-1.5-1.5S7.67 9 8.5 9s1.5.67 1.5 1.5S9.33 12 8.5 12zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5S16.33 12 15.5 12z" />
    </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);

const ThumbsUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
    </svg>
);

const ThumbsDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
    </svg>
);


const AiAssistant: React.FC<AiAssistantProps> = ({ context, setView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([{
                id: crypto.randomUUID(),
                sender: 'ai',
                text: "Hello! I'm Wolfie, your AI assistant. How can I help you focus on what matters most today?"
            }]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Effect to handle Escape key and clicks outside
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage || isLoading) return;

        setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'user', text: userMessage }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await getAiAssistantResponse(userMessage, context);
            const aiMessage: ChatMessage = {
                id: crypto.randomUUID(),
                sender: 'ai',
                text: response.text,
            };

            if (response.responseType === 'navigation_suggestion' && response.view) {
                aiMessage.navigationSuggestion = response.view;
            }
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("AI Assistant error:", error);
            const friendlyErrorMessage = "I'm sorry, but I encountered an unexpected problem. Please try rephrasing your message or try again in a moment.";
            setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: friendlyErrorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmNavigation = (view: View) => {
        setView(view);
        setIsOpen(false);
    };

    const handleDenyNavigation = (messageId: string) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === messageId ? { ...msg, navigationSuggestion: undefined } : msg
            )
        );
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    sender: 'ai',
                    text: "No problem. How else can I assist you?",
                }
            ]);
        }, 200);
    };

    const handleFeedback = (messageId: string, messageIndex: number, feedback: 'up' | 'down') => {
        let userQuery = "N/A";
        let aiResponse = "";
    
        setMessages(prev => {
            if (messageIndex > 0) {
                // Find the preceding user message for context
                for (let i = messageIndex - 1; i >= 0; i--) {
                    if (prev[i].sender === 'user') {
                        userQuery = prev[i].text;
                        break;
                    }
                }
            }
            
            const updatedMessages = prev.map(msg => {
                if (msg.id === messageId) {
                    aiResponse = msg.text;
                    return { ...msg, feedback };
                }
                return msg;
            });
    
            // Log feedback for analysis (simulates sending to a backend)
            console.log("Feedback Submitted:", {
                userQuery,
                aiResponse,
                feedback,
            });
    
            return updatedMessages;
        });
    };

    const fabButtonClass = `fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[1060] w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none`;
    const chatWindowClass = `fixed inset-x-0 bottom-0 md:inset-auto md:bottom-24 md:right-6 z-[1050] w-full h-[85vh] md:w-[90vw] md:max-w-md md:h-[70vh] md:max-h-[600px] flex flex-col shadow-2xl rounded-t-2xl md:rounded-lg transition-all duration-300 ease-in-out origin-bottom md:origin-bottom-right`;

    return (
        <>
             {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-[1040] md:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`${fabButtonClass} ${isOpen ? 'bg-gray-600' : 'bg-blue-500'}`}
                style={{
                    background: `var(--color-secondary-blue)`,
                    color: `var(--color-text-on-accent)`,
                    textShadow: `0 0 8px var(--color-secondary-blue-glow)`
                }}
                aria-label="Toggle AI Assistant"
            >
                {isOpen ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <WolfIcon className="w-8 h-8" />
                )}
            </button>
            
            <div
                ref={chatWindowRef}
                onClick={(e) => e.stopPropagation()}
                className={`${chatWindowClass} ${isOpen ? 'translate-y-0 opacity-100 md:scale-100' : 'translate-y-full opacity-0 pointer-events-none md:translate-y-0 md:scale-95'}`}
                style={{ background: `var(--color-bg-dark)`, border: `1px solid var(--color-border)` }}
            >
                <header className="relative p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-500 md:hidden" />
                    <h3 className="text-lg text-center md:text-left font-bold m-0" style={{ color: `var(--color-text-primary)` }}>Wolfie Assistant</h3>
                     <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                        aria-label="Close chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, msgIndex) => (
                        <div key={msg.id} className={`w-full flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex flex-col max-w-[90%] group">
                                <div className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full flex-shrink-0 self-start flex items-center justify-center text-white" style={{ background: `var(--color-secondary-blue)` }}><WolfIcon className="w-5 h-5"/></div>}
                                    <div
                                        className={`max-w-full p-3 rounded-lg text-sm md:text-base ${msg.sender === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}
                                        style={{
                                            background: msg.sender === 'user' ? `var(--color-secondary-blue)` : `var(--color-bg-panel)`,
                                            color: msg.sender === 'user' ? `var(--color-text-on-accent)` : `var(--color-text-primary)`
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                                
                                {(msg.navigationSuggestion || msg.sender === 'ai') && (
                                    <div className={`flex justify-between items-center mt-2 h-6 ${msg.sender === 'ai' ? 'ml-10' : ''}`}>
                                        {msg.navigationSuggestion ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleConfirmNavigation(msg.navigationSuggestion!)}
                                                    className="text-xs font-bold py-1.5 px-3 rounded hover:opacity-80 transition-opacity"
                                                    style={{ background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)' }}
                                                >
                                                    Yes, take me there
                                                </button>
                                                <button
                                                    onClick={() => handleDenyNavigation(msg.id)}
                                                    className="text-xs font-bold py-1.5 px-3 rounded hover:opacity-80 transition-opacity"
                                                    style={{ background: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                                                >
                                                    No, thanks
                                                </button>
                                            </div>
                                        ) : <div />}
                                        
                                        {msg.sender === 'ai' && (
                                            <div className={`flex items-center gap-2 transition-opacity duration-300 ${!msg.feedback ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                                {!msg.feedback ? (
                                                    <>
                                                        <button onClick={() => handleFeedback(msg.id, msgIndex, 'up')} className="p-1 text-gray-500 hover:text-green-500 rounded-full" aria-label="Good response">
                                                            <ThumbsUpIcon className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleFeedback(msg.id, msgIndex, 'down')} className="p-1 text-gray-500 hover:text-red-500 rounded-full" aria-label="Bad response">
                                                            <ThumbsDownIcon className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className={`p-1 rounded-full ${msg.feedback === 'up' ? 'text-green-500' : 'text-gray-600'}`} disabled>
                                                            <ThumbsUpIcon className="w-4 h-4" />
                                                        </button>
                                                        <button className={`p-1 rounded-full ${msg.feedback === 'down' ? 'text-red-500' : 'text-gray-600'}`} disabled>
                                                            <ThumbsDownIcon className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: `var(--color-secondary-blue)` }}><WolfIcon className="w-5 h-5"/></div>
                             <div className="max-w-[80%] p-3 rounded-lg rounded-bl-none" style={{ background: `var(--color-bg-panel)`}}>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about your day..."
                            className="w-full pl-4 pr-12 py-3 rounded-full text-sm"
                            style={{ background: 'var(--color-bg-main)', border: `1px solid var(--color-border)`, color: 'var(--color-text-primary)' }}
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full" style={{ background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)' }} disabled={isLoading || !inputValue.trim()}>
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AiAssistant;